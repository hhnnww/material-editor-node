import type { InferRouterInputs } from "@orpc/server";
import sharp, { type OverlayOptions } from "sharp";
import type { ORPC_制作详情 } from "#/orpc/router/orpc-制作详情";
import { setting } from "#/setting";
import { makeTextImage } from "../fun-图片功能/fun-制作文字图片2";
import { FUN_获取LOGO图片 } from "../fun-图片功能/fun-获取logo图片";
import { XQ_制作标题 } from "./xq-制作标题";

/**
 * 制作预览图详情页（防裁剪、完整显示完美版）
 */
export async function XQ_制作预览图(
	props: InferRouterInputs<typeof ORPC_制作详情>,
) {
	const width = setting.xqWidth;
	const nameFontColor = "#333";
	const sizeFontColor = "#333";

	console.log("[制作预览图] 1. 开始初始化公共素材...");
	const imgToLogoSpacing = 60;
	const logoToNameSpacing = 30;
	const nameToSizeSpacing = 30;
	const bottomSpacing = 320;

	// 并行初始化公共素材（标题和 LOGO）
	const [titleImg, logoImage] = await Promise.all([
		XQ_制作标题({ title: "素材预览图", desc: "* 素材内容以预览图为准" }),
		FUN_获取LOGO图片({ fillColor: nameFontColor, height: 60 }),
	]);

	// 一次性获取标题和LOGO的元数据
	const [titleMeta, logoMeta] = await Promise.all([
		sharp(titleImg).metadata(),
		sharp(logoImage).metadata(),
	]);
	const logoHeight = logoMeta.height || 0;
	const logoWidth = logoMeta.width || 0;

	const availableWidth = width - props.outerSpacing * 2;
	const itemWidth = Math.floor(
		(availableWidth - (props.rows - 1) * props.innerSpacing) / props.rows,
	);
	const remainder =
		props.rows >= 2 ? props.previewImageList.length % props.rows : 0;
	const firstRowItemWidth =
		remainder > 0
			? Math.floor(
					(availableWidth - (remainder - 1) * props.innerSpacing) / remainder,
				)
			: itemWidth;

	const composites: OverlayOptions[] = [];
	composites.push({ input: titleImg, top: 0, left: 0 });

	let currentY = titleMeta.height || 0;

	// ==========================================
	// 2. 多图片异步流的限流排队
	// ==========================================
	console.log(
		`[制作预览图] 2. 开始处理子项，总计: ${props.previewImageList.length} 张`,
	);

	const processedItems = new Array(props.previewImageList.length);

	const CONCURRENCY_LIMIT = 4;
	let currentIndex = 0;

	// 工作队列处理器
	async function queueWorker() {
		while (currentIndex < props.previewImageList.length) {
			const index = currentIndex++; // 抢占当前任务
			const img = props.previewImageList[index];

			try {
				const isFirstRowRemainder = remainder > 0 && index < remainder;
				const currentItemWidth = isFirstRowRemainder
					? firstRowItemWidth
					: itemWidth;

				// 1. 进行物理旋转校正并强制缩放到指定宽度
				const pipeline = sharp(img.imagePath)
					.rotate()
					.resize({ width: currentItemWidth });

				// 2. 先安全导出物理缩放 buffer，拿到绝对稳固的最终物理图片
				const resizedBuffer = await pipeline.toBuffer();

				// 再次读取真实落盘数据的确切宽高
				const imgMeta = await sharp(resizedBuffer).metadata();
				const currentImgWidth = imgMeta.width || currentItemWidth;
				const currentImgHeight = imgMeta.height || 0;

				if (currentImgHeight === 0) {
					console.warn(
						`[制作预览图] 警告：第 ${index} 张图片高度计算为0 已跳过。`,
					);
					continue;
				}

				let imgBuffer: Buffer;

				// 3. 🔥 终极无缝圆角机制：基于图片真实宽高动态生成 SVG，并且加上精确的宽高属性，彻底防尺寸报错与缩减
				if (props.borderRadius > 0) {
					const maskSvg = Buffer.from(
						`<svg width="${currentImgWidth}" height="${currentImgHeight}">
                            <rect x="0" y="0" width="${currentImgWidth}" height="${currentImgHeight}" rx="${props.borderRadius}" ry="${props.borderRadius}" fill="black" />
                         </svg>`,
					);

					// 用绝对相等的宽高进行一次性复合，彻底解决 dimensions 报错，且保证图片 100% 完整显示
					imgBuffer = await sharp(resizedBuffer)
						.composite([
							{
								input: maskSvg,
								blend: "dest-in",
							},
						])
						.png()
						.toBuffer();
				} else {
					imgBuffer = await sharp(resizedBuffer).png().toBuffer();
				}

				// 4. 生成文字信息
				const nameText = img.materialName.toUpperCase();
				const ext = img.materialName.split(".").pop()?.toLowerCase();
				const sizeText = ["ai", "eps"].includes(ext || "")
					? "AI矢量素材"
					: `${img.width}×${img.height}(PX)`;

				const [nameImg, sizeImg] = await Promise.all([
					makeTextImage({
						text: nameText,
						fontWeight: "Light",
						fillColor: nameFontColor,
						height: 40,
					}),
					makeTextImage({
						text: sizeText,
						fontWeight: "Light",
						fillColor: sizeFontColor,
						height: 35,
					}),
				]);

				// 5. 获取文字精确物理尺寸
				const [nameMeta, sizeMeta] = await Promise.all([
					sharp(nameImg).metadata(),
					sharp(sizeImg).metadata(),
				]);

				const totalHeight =
					currentImgHeight +
					imgToLogoSpacing +
					logoHeight +
					logoToNameSpacing +
					(nameMeta.height || 0) +
					nameToSizeSpacing +
					(sizeMeta.height || 0);

				// 保存当前位置的计算结果
				processedItems[index] = {
					imgBuffer,
					imgHeight: currentImgHeight,
					nameImg,
					nameWidth: nameMeta.width || 0,
					nameHeight: nameMeta.height || 0,
					sizeImg,
					sizeWidth: sizeMeta.width || 0,
					totalHeight,
					itemWidthUsed: currentItemWidth,
				};
			} catch (err) {
				console.error(
					`[制作预览图] 处理第 ${index} 张图 (${img?.imagePath || "未知路径"}) 出错:`,
					err,
				);
			}
		}
	}

	// 启动有限并发通道
	const workers = Array.from({ length: CONCURRENCY_LIMIT }, () =>
		queueWorker(),
	);
	await Promise.all(workers);

	console.log("[制作预览图] 3. 子项 Buffer 生成完毕，开始计算拼图坐标...");
	let i = 0;
	while (i < processedItems.length) {
		const take = i === 0 && remainder > 0 ? remainder : props.rows;
		const row = processedItems.slice(i, i + take);
		i += take;

		const maxHeight = Math.max(
			...row.map((item) => (item ? item.totalHeight : 0)),
		);
		const maxImgHeight = Math.max(...row.map((r) => (r ? r.imgHeight : 0)));

		row.forEach((item, index) => {
			if (!item) return;

			const x =
				props.outerSpacing + index * (item.itemWidthUsed + props.innerSpacing);
			const imgYOffset = maxImgHeight - item.imgHeight;

			// 压入原图 Buffer
			composites.push({
				input: item.imgBuffer,
				top: currentY + imgYOffset,
				left: x,
			});

			// LOGO 居中布局
			const logoX = x + Math.floor((item.itemWidthUsed - logoWidth) / 2);
			const logoY = currentY + maxImgHeight + imgToLogoSpacing;
			composites.push({ input: logoImage, top: logoY, left: logoX });

			// 素材名居中布局
			const nameX = x + Math.floor((item.itemWidthUsed - item.nameWidth) / 2);
			const nameY = logoY + logoHeight + logoToNameSpacing;
			composites.push({ input: item.nameImg, top: nameY, left: nameX });

			// 尺寸居中布局
			const sizeX = x + Math.floor((item.itemWidthUsed - item.sizeWidth) / 2);
			const sizeY = nameY + item.nameHeight + nameToSizeSpacing;
			composites.push({ input: item.sizeImg, top: sizeY, left: sizeX });
		});

		currentY += maxHeight + bottomSpacing;
	}

	const totalHeight = currentY + props.outerSpacing;

	console.log(`[制作预览图] 4. 开始最终画布大合流，预计总高: ${totalHeight}px`);

	const baseCanvas = sharp({
		create: {
			width: width,
			height: totalHeight,
			channels: 4,
			background: { r: 255, g: 255, b: 255, alpha: 1 },
		},
	}).composite(composites);

	console.log("[制作预览图] 🎉 整体完美完成！");
	return await baseCanvas.png().toBuffer();
}
