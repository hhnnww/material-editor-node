import type { InferRouterInputs } from "@orpc/server";
import sharp from "sharp";
import type { ORPC_制作首图 } from "#/orpc/router/orpc-制作首图";
import { setting } from "#/setting";

export async function ST_列自适应(
	props: InferRouterInputs<typeof ORPC_制作首图>,
) {
	/**
	 * 根据rows和spacing计算单列的宽度
	 * 然后把图片缩小从第一列 上面开始往下排列
	 * 如果超出了背景高度
	 * 则从第二列开始排列
	 * 超出部分裁剪掉
	 * 每一列要确定超出了height
	 * 才开始从第二列开始排列
	 * 宽度向上取整
	 * 保证填满画布
	 * 如果图片数量不够，自动从头开始遍历
	 */
	const width = setting.stWidth;
	const height = setting.stHeight;

	const availableWidth = width - props.outerSpacing * 2;

	// 1. 计算单列宽度 (根据 rows 决定列数，这里 rows 实际上代表列数)
	const colCount = props.rows;
	const colWidth = Math.ceil(
		(availableWidth - props.innerSpacing * (colCount - 1)) / colCount,
	);

	const layout: any[] = [];
	let currentCol = 0;
	let currentY = props.outerSpacing;
	let imgIndex = 0;

	// 2. 循环排列图片，直到填满所有列
	while (currentCol < colCount) {
		const img = props.imageList[imgIndex % props.imageList.length];

		// 根据列宽和图片比例计算高度
		const itemHeight = Math.floor(colWidth / img.imageRatio);

		// 检查当前列是否已经填满（当前高度是否已经达到或超过可用高度）
		if (currentY >= height - props.outerSpacing) {
			currentCol++;
			currentY = props.outerSpacing;
			// 换列后重新检查是否超出总列数
			if (currentCol >= colCount) break;
		}

		// 计算实际绘制高度（如果超出底部则裁剪）
		const finalHeight = Math.min(
			itemHeight,
			height - props.outerSpacing - currentY,
		);

		layout.push({
			imagePath: img.imagePath,
			x: props.outerSpacing + currentCol * (colWidth + props.innerSpacing),
			y: currentY,
			width: colWidth,
			height: finalHeight,
		});

		currentY += finalHeight + props.innerSpacing;
		imgIndex++;
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
					position: "top",
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
