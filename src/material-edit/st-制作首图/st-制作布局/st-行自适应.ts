import type { InferRouterInputs } from "@orpc/server";
import sharp from "sharp";
import type { ORPC_制作首图 } from "#/orpc/router/orpc-制作首图";
import { setting } from "#/setting";

export async function ST_行自适应(
	props: InferRouterInputs<typeof ORPC_制作首图>,
) {
	/**
	 * 1, 计算单行高度
	 * 2，缩小小图，每张图片根据高度和自己的图片比例，缩小到适合的尺寸，如果props.borderRadius大于0
	 * 则给小图添加圆角
	 * 3，一行行排列，如果单行宽度超出了大图的宽度，则从中间裁剪
	 * 4，把每一行拼接起来组合成大图
	 */
	const width = setting.stWidth;
	const height =
		props.style === "黑鲸"
			? setting.stHeight - setting.stHeijingHeight
			: setting.stHeight;

	const availableWidth = width - props.outerSpacing * 2;
	const availableHeight = height - props.outerSpacing * 2;

	// 1. 计算单行高度
	const rowHeight = Math.ceil(
		(availableHeight - props.innerSpacing * (props.rows - 1)) / props.rows,
	);

	const layout = [];
	let imgIndex = 0;

	// 2. 逐行计算布局
	for (let r = 0; r < props.rows; r++) {
		const rowImages = [];
		let totalWidthInRow = 0;

		// 填充图片直到宽度超过 availableWidth
		while (totalWidthInRow < availableWidth) {
			const img = props.imageList[imgIndex % props.imageList.length];
			const itemWidth = Math.floor(rowHeight * img.imageRatio);
			rowImages.push({
				imagePath: img.imagePath,
				originalWidth: itemWidth,
			});
			totalWidthInRow +=
				itemWidth + (rowImages.length > 1 ? props.innerSpacing : 0);
			imgIndex++;
		}

		// 计算超出部分的溢出量
		const overflow = totalWidthInRow - availableWidth;

		// 如果该行只有一张图，直接裁剪
		if (rowImages.length === 1) {
			layout.push({
				imagePath: rowImages[0].imagePath,
				x: props.outerSpacing,
				y: props.outerSpacing + r * (rowHeight + props.innerSpacing),
				width: availableWidth,
				height: rowHeight,
			});
		} else {
			// 裁剪第一张和最后一张图片来适应宽度（平分溢出量）
			const cutAmount = Math.floor(overflow / 2);
			let currentX = props.outerSpacing;

			for (let i = 0; i < rowImages.length; i++) {
				let finalWidth = rowImages[i].originalWidth;
				let position = "center";

				if (i === 0) {
					finalWidth -= cutAmount;
					position = "right"; // 第一张图减去左侧，相当于保留右侧（从左边裁剪）
				}
				if (i === rowImages.length - 1) {
					finalWidth = props.outerSpacing + availableWidth - currentX;
					position = "left"; // 最后一张图减去右侧，相当于保留左侧（从右边裁剪）
				}

				layout.push({
					imagePath: rowImages[i].imagePath,
					x: currentX,
					y: props.outerSpacing + r * (rowHeight + props.innerSpacing),
					width: Math.max(1, finalWidth),
					height: rowHeight,
					position,
				});

				currentX += finalWidth + props.innerSpacing;
			}
		}
	}

	// 3. 绘制
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
					fit: "cover",
					position: item.position || "center",
				})
				.toBuffer();

			if (props.borderRadius > 0) {
				const mask = Buffer.from(
					`<svg><rect x="0" y="0" width="${item.width}" height="${item.height}" rx="${props.borderRadius}" ry="${props.borderRadius}" /></svg>`,
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
