import type { InferRouterInputs } from "@orpc/server";
import sharp from "sharp";
import type { ORPC_制作首图 } from "#/orpc/router/orpc-制作首图";
import { setting } from "#/setting";

export async function ST_1大1小(
	props: InferRouterInputs<typeof ORPC_制作首图>,
) {
	/**
	 * 计算大图的宽度 根据width 和两个spacing
	 * 把图片列表中的第一张图片缩放,粘贴到大图
	 * 剩下的图片根据剩下的空间横向排列,计算出适合的图片数量
	 * 然后根据图片数量计算出固定的宽度
	 * 把剩下的图片缩小裁剪
	 * 粘贴到第二排
	 * 返回图片
	 */
	const width = setting.stWidth;
	const height =
		props.style === "黑鲸"
			? setting.stHeight - setting.stHeijingHeight
			: setting.stHeight;

	const availableWidth = width - props.outerSpacing * 2;
	const availableHeight = height - props.outerSpacing * 2;

	// 1. 大图处理 (第一张)：保证不被裁剪 (fit: contain)
	const bigImage = props.imageList[0];
	// 预估大图高度，给小图留出约 1/4 到 1/3 的空间，或者根据比例计算
	// 这里固定大图高度为可用高度的 70%，确保下方有空间
	const bigRowHeight = Math.floor(
		(availableHeight - props.innerSpacing) * 0.75,
	);
	const smallRowHeight = availableHeight - props.innerSpacing - bigRowHeight;

	const layout: any[] = [
		{
			imagePath: bigImage.imagePath,
			x: props.outerSpacing,
			y: props.outerSpacing,
			width: availableWidth,
			height: bigRowHeight,
			fit: "cover" as const, // 保证宽度占满并填满区域
		},
	];

	// 2. 小图处理 (剩余图片)
	const remainingImages = props.imageList.slice(1);
	if (remainingImages.length > 0) {
		// 根据剩余图片的平均比例计算适合放多少张
		const avgRatio =
			remainingImages.reduce((acc, img) => acc + img.imageRatio, 0) /
			remainingImages.length;

		// 计算单行适合的列数: 可用宽度 / (小图高度 * 平均比例)
		const colsPerRow =
			Math.round(availableWidth / (smallRowHeight * avgRatio)) || 1;

		// 计算最终小图宽度
		const smallItemWidth = Math.ceil(
			(availableWidth - props.innerSpacing * (colsPerRow - 1)) / colsPerRow,
		);

		for (let i = 0; i < colsPerRow; i++) {
			// 如果图片不够，则循环使用剩余图片列表
			const img = remainingImages[i % remainingImages.length];
			layout.push({
				imagePath: img.imagePath,
				x: props.outerSpacing + i * (smallItemWidth + props.innerSpacing),
				y: props.outerSpacing + bigRowHeight + props.innerSpacing,
				width:
					i === colsPerRow - 1
						? availableWidth - i * (smallItemWidth + props.innerSpacing)
						: smallItemWidth,
				height: smallRowHeight,
				fit: "cover" as const,
			});
		}
	}

	// 4. 绘制
	const canvas = sharp({
		create: {
			width: setting.stWidth,
			height: setting.stHeight,
			channels: 4,
			background: { r: 255, g: 255, b: 255, alpha: 0 },
		},
	});

	const compositeOperations = await Promise.all(
		layout.map(async (item) => {
			let imageBuffer = await sharp(item.imagePath)
				.resize(item.width, item.height, {
					fit: item.fit,
					position: "center",
				})
				.toBuffer();

			if (props.borderRadius > 0) {
				const mask = Buffer.from(
					`<svg><rect x="0" y="0" width="${item.width}" height="${
						item.height
					}" rx="${props.borderRadius}" ry="${props.borderRadius}" /></svg>`,
				);
				imageBuffer = await sharp(imageBuffer)
					.composite([{ input: mask, blend: "dest-in" }])
					.png()
					.toBuffer();
			}

			return {
				input: imageBuffer,
				left: item.x,
				top: item.y,
			};
		}),
	);

	return await canvas.composite(compositeOperations).png().toBuffer();
}
