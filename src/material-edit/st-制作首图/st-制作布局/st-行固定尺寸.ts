import type { InferRouterInputs } from "@orpc/server";
import sharp from "sharp";
import type { ORPC_制作首图 } from "#/orpc/router/orpc-制作首图";
import { setting } from "#/setting";

export async function ST_行固定尺寸(
	props: InferRouterInputs<typeof ORPC_制作首图>,
) {
	/**
	 * 1，先计算所有图片的平均比例
	 * 2，计算单行的高度
	 * 3，把每张图片，按照单行高度，和平均比例，缩小和裁剪
	 * 4，每张图片排列到大图上面
	 */
	const width = setting.stWidth;
	const height =
		props.style === "黑鲸"
			? setting.stHeight - setting.stHeijingHeight
			: setting.stHeight;

	const availableWidth = width - props.outerSpacing * 2;
	const availableHeight = height - props.outerSpacing * 2;

	// 1. 计算所有图片的平均比例
	const avgRatio =
		props.imageList.reduce((acc, img) => acc + img.imageRatio, 0) /
		props.imageList.length;

	// 2. 计算单行的高度
	const rowHeight = Math.ceil(
		(availableHeight - props.innerSpacing * (props.rows - 1)) / props.rows,
	);

	// 3. 计算固定宽度和每行布局
	const itemWidth = Math.floor(rowHeight * avgRatio);
	const layout = [];
	let imgIndex = 0;

	for (let r = 0; r < props.rows; r++) {
		const rowImages = [];
		let totalWidthInRow = 0;

		// 填充图片直到宽度超过 availableWidth
		while (totalWidthInRow < availableWidth) {
			const img = props.imageList[imgIndex % props.imageList.length];
			rowImages.push({ imagePath: img.imagePath });
			totalWidthInRow +=
				itemWidth + (rowImages.length > 1 ? props.innerSpacing : 0);
			imgIndex++;
		}

		const overflow = totalWidthInRow - availableWidth;
		const cutAmount = Math.floor(overflow / 2);
		let currentX = props.outerSpacing;

		for (let i = 0; i < rowImages.length; i++) {
			let finalWidth = itemWidth;
			let position = "center";

			if (i === 0) {
				finalWidth -= cutAmount;
				position = "right"; // 从左边裁剪，保留右侧
			} else if (i === rowImages.length - 1) {
				// 确保填满，最后一张宽度为剩余宽度
				finalWidth = props.outerSpacing + availableWidth - currentX;
				position = "left"; // 从右边裁剪，保留左侧
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
