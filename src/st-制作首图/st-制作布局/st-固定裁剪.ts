import type { InferRouterInputs } from "@orpc/server";
import sharp from "sharp";
import type { ORPC_制作首图 } from "#/orpc/router/orpc-制作首图";
import { setting } from "#/setting";

export async function ST_固定裁剪(
	props: InferRouterInputs<typeof ORPC_制作首图>,
) {
	const width = setting.stWidth;
	const height =
		props.style === "黑鲸"
			? setting.stHeight - setting.stHeijingHeight
			: setting.stHeight;

	// 1. 计算单行可用高度 (总高度 - 外边距*2 - 内边距*(行数-1)) / 行数
	const availableHeight =
		height - props.outerSpacing * 2 - props.innerSpacing * (props.rows - 1);
	const rowHeight = Math.floor(availableHeight / props.rows);

	// 2. 获取所有图片的比例并计算平均比例
	const imageRatios = await Promise.all(
		props.imageList.map(async (img) => {
			return img.imageRatio;
		}),
	);
	const avgRatio = imageRatios.reduce((a, b) => a + b, 0) / imageRatios.length;

	// 3. 计算单行最适合的图片数量
	// 单个图片估算宽度 = rowHeight * avgRatio
	// 可用总宽度 = width - outerSpacing * 2
	const availableWidth = width - props.outerSpacing * 2;
	const colsPerRow = Math.round(availableWidth / (rowHeight * avgRatio)) || 1;

	// 4. 计算最终单个图片的裁剪宽度 (考虑内边距)
	const itemWidth = Math.floor(
		(availableWidth - props.innerSpacing * (colsPerRow - 1)) / colsPerRow,
	);

	// 5. 生成排列坐标
	const totalCells = props.rows * colsPerRow;
	const layout = Array.from({ length: totalCells }).map((_, index) => {
		const row = Math.floor(index / colsPerRow);
		const col = index % colsPerRow;
		// 如果图片不够，则循环使用图片列表
		const imageItem = props.imageList[index % props.imageList.length];

		return {
			imagePath: imageItem.imagePath,
			x: props.outerSpacing + col * (itemWidth + props.innerSpacing),
			y: props.outerSpacing + row * (rowHeight + props.innerSpacing),
			width: itemWidth,
			height: rowHeight,
			borderRadius: props.borderRadius > 0 ? props.borderRadius : undefined,
		};
	});

	// 6. 使用 sharp 绘制图片
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

			if (item.borderRadius) {
				const mask = Buffer.from(
					`<svg><rect x="0" y="0" width="${item.width}" height="${item.height}" rx="${item.borderRadius}" ry="${item.borderRadius}" /></svg>`,
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
