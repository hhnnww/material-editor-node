import type { InferRouterInputs } from "@orpc/server";
import sharp, { type OverlayOptions } from "sharp";
import { FUN_制作文字图片 } from "#/material-edit/fun-图片功能/fun-制作文字图片";
import type { ORPC_制作详情 } from "#/orpc/router/orpc-制作详情";
import { setting } from "#/setting";
import { XQ_制作标题 } from "./xq-制作标题";

export async function XQ_制作预览图(
	props: InferRouterInputs<typeof ORPC_制作详情>,
) {
	const width = setting.xqWidth;

	const nameFontSize = 56;
	const nameFontColor = "#333";
	const nameFontWeight = "Light";

	const sizeFontSize = 49;
	const sizeFontColor = "#333";
	const sizeFontWeight = "Light";

	const imgToNameSpacing = 80;
	const nameToSizeSpacing = 30;
	const bottomSpacing = 320;

	const titleImg = await XQ_制作标题({
		title: "素材预览图",
		desc: "* 素材内容以预览图为准",
	});
	const titleMeta = await sharp(titleImg).metadata();

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

	// 存储所有待合成的图层
	const composites: OverlayOptions[] = [];
	// 添加标题图层
	composites.push({ input: titleImg, top: 0, left: 0 });

	// 记录当前绘制的垂直位置
	let currentY = titleMeta.height || 0;

	// 1. 预处理所有图片和文字
	const processedItems = await Promise.all(
		props.previewImageList.map(async (img, index) => {
			// 判断是否属于第一排余数部分
			const isFirstRowRemainder = remainder > 0 && index < remainder;
			const currentItemWidth = isFirstRowRemainder
				? firstRowItemWidth
				: itemWidth;

			let imgBuffer = await sharp(img.imagePath)
				.resize(currentItemWidth)
				.toBuffer();
			const imgMeta = await sharp(imgBuffer).metadata();
			const currentImgWidth = imgMeta.width || currentItemWidth;
			const currentImgHeight = imgMeta.height || 0;

			if (props.borderRadius > 0) {
				const mask = Buffer.from(
					`<svg><rect x="0" y="0" width="${currentImgWidth}" height="${currentImgHeight}" rx="${props.borderRadius}" ry="${props.borderRadius}" /></svg>`,
				);
				imgBuffer = await sharp(imgBuffer)
					.composite([{ input: mask, blend: "dest-in" }])
					.png()
					.toBuffer();
			}

			const nameText = img.materialName.toUpperCase();
			const nameImg = await FUN_制作文字图片({
				text: nameText,
				fontSize: nameFontSize,
				fontWidth: nameFontWeight,
				fillColor: nameFontColor,
			});

			let processedNameImg = nameImg;
			let nameMeta = await sharp(processedNameImg).metadata();
			if ((nameMeta.width || 0) > currentItemWidth) {
				processedNameImg = await sharp(processedNameImg)
					.resize(currentItemWidth)
					.toBuffer();
				nameMeta = await sharp(processedNameImg).metadata();
			}

			const ext = img.materialName.split(".").pop()?.toLowerCase();
			const sizeText = ["ai", "eps"].includes(ext || "")
				? "AI矢量素材"
				: `${img.width}×${img.height}(PX)`;

			const sizeImg = await FUN_制作文字图片({
				text: sizeText,
				fontSize: sizeFontSize,
				fontWidth: sizeFontWeight,
				fillColor: sizeFontColor,
			});

			let processedSizeImg = sizeImg;
			let sizeMeta = await sharp(processedSizeImg).metadata();
			if ((sizeMeta.width || 0) > currentItemWidth) {
				processedSizeImg = await sharp(processedSizeImg)
					.resize(currentItemWidth)
					.toBuffer();
				sizeMeta = await sharp(processedSizeImg).metadata();
			}

			const totalHeight =
				currentImgHeight +
				imgToNameSpacing +
				(nameMeta.height || 0) +
				nameToSizeSpacing +
				(sizeMeta.height || 0);

			return {
				imgBuffer,
				imgMeta,
				nameImg: processedNameImg,
				nameMeta,
				sizeImg: processedSizeImg,
				sizeMeta,
				totalHeight,
				itemWidthUsed: currentItemWidth,
			};
		}),
	);

	// 2. 分行排列
	let i = 0;
	while (i < processedItems.length) {
		// 如果有余数且是第一排，则取余数个，否则取 rows 个
		const take = i === 0 && remainder > 0 ? remainder : props.rows;
		const row = processedItems.slice(i, i + take);
		i += take;

		const maxHeight = Math.max(...row.map((item) => item.totalHeight));

		row.forEach((item, index) => {
			const x =
				props.outerSpacing + index * (item.itemWidthUsed + props.innerSpacing);
			// 计算图片底部对齐的偏移量：当前行最大图片高度 - 自身图片高度
			const maxImgHeight = Math.max(...row.map((r) => r.imgMeta.height || 0));
			const imgYOffset = maxImgHeight - (item.imgMeta.height || 0);

			// 图片
			composites.push({
				input: item.imgBuffer,
				top: currentY + imgYOffset,
				left: x,
			});

			// 素材名居中
			const nameX =
				x + Math.floor((item.itemWidthUsed - (item.nameMeta.width || 0)) / 2);
			const nameY = currentY + maxImgHeight + imgToNameSpacing;
			composites.push({ input: item.nameImg, top: nameY, left: nameX });

			// 尺寸居中
			const sizeX =
				x + Math.floor((item.itemWidthUsed - (item.sizeMeta.width || 0)) / 2);
			const sizeY = nameY + (item.nameMeta.height || 0) + nameToSizeSpacing;
			composites.push({ input: item.sizeImg, top: sizeY, left: sizeX });
		});

		currentY += maxHeight + bottomSpacing;
	}

	const totalHeight = currentY + props.outerSpacing;

	const result = await sharp({
		create: {
			width: width,
			height: totalHeight,
			channels: 4,
			background: { r: 255, g: 255, b: 255, alpha: 1 },
		},
	})
		.composite(composites)
		.png()
		.toBuffer();

	// 释放内存
	sharp.cache(false);
	sharp.cache(true);

	return result;
}
