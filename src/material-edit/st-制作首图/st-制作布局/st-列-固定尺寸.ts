import type { InferRouterInputs } from "@orpc/server";
import sharp from "sharp";
import type { ORPC_制作首图 } from "#/orpc/router/orpc-制作首图";
import { setting } from "#/setting";

export async function ST_列_固定尺寸(
	props: InferRouterInputs<typeof ORPC_制作首图>,
) {
	/**
	 * 1 计算所有图片的平均比例
	 * 2 根据rows计算每一列的宽度
	 * 3 根据平均比例把每一个小图缩小裁剪成同一个尺寸
	 * 4 每一列从顶部往下粘贴图片，超出后从第二列开始粘贴
	 * 5 组合成大图
	 */
	const width = setting.stWidth;
	const height = setting.stHeight;

	const availableWidth = width - props.outerSpacing * 2;

	// 1. 计算所有图片的平均比例
	const avgRatio =
		props.imageList.reduce((acc, img) => acc + img.imageRatio, 0) /
		props.imageList.length;

	// 2. 根据 rows 计算每一列的宽度 (这里 rows 实际上代表列数)
	const colCount = props.rows;
	const colWidth = Math.ceil(
		(availableWidth - props.innerSpacing * (colCount - 1)) / colCount,
	);

	// 3. 根据平均比例计算固定高度
	const itemHeight = Math.floor(colWidth / avgRatio);

	const layout = [];
	let currentCol = 0;
	let currentY = props.outerSpacing;
	let imgIndex = 0;

	// 4. 循环排列图片
	while (currentCol < colCount) {
		const img = props.imageList[imgIndex % props.imageList.length];

		// 检查当前列是否已经填满
		if (currentY >= height - props.outerSpacing) {
			currentCol++;
			currentY = props.outerSpacing;
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

	// 5. 绘制
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
					position: "center",
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

			return { input: imageBuffer, left: item.x, top: item.y };
		}),
	);

	return await canvas.composite(compositeOperations).png().toBuffer();
}
