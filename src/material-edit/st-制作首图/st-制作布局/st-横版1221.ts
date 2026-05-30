import type { InferRouterInputs } from "@orpc/server";
import sharp from "sharp";
import type { ORPC_制作首图 } from "#/orpc/router/orpc-制作首图";
import { setting } from "#/setting";

export async function ST_横版1221(
	props: InferRouterInputs<typeof ORPC_制作首图>,
) {
	/**
	 * 把背景大图分割成横向3格
	 * 竖向4格
	 * 第一张图占横向2格 竖向2格,粘贴进去
	 * 右边竖向排列2格小图
	 * 左下角竖向排列2格小图
	 * 右下角排列1张大图占很像2格竖向2格
	 */
	const width = setting.stWidth;
	const height =
		props.style === "黑鲸"
			? setting.stHeight - setting.stHeijingHeight
			: setting.stHeight;

	const availableWidth = width - props.outerSpacing * 2;
	const availableHeight = height - props.outerSpacing * 2;

	// 计算基础单元格尺寸 (3列 x 4行)
	const cellWidth = (availableWidth - props.innerSpacing * 2) / 3;
	const cellHeight = (availableHeight - props.innerSpacing * 3) / 4;

	// 定义布局块
	const layoutConfigs = [
		// 1. 左上大图: 占 2列 x 2行
		{
			imgIdx: 0,
			col: 0,
			row: 0,
			colSpan: 2,
			rowSpan: 2,
		},
		// 2. 右上小图1: 占 1列 x 1行
		{
			imgIdx: 1,
			col: 2,
			row: 0,
			colSpan: 1,
			rowSpan: 1,
		},
		// 3. 右上小图2: 占 1列 x 1行
		{
			imgIdx: 2,
			col: 2,
			row: 1,
			colSpan: 1,
			rowSpan: 1,
		},
		// 4. 左下小图1: 占 1列 x 1行
		{
			imgIdx: 3,
			col: 0,
			row: 2,
			colSpan: 1,
			rowSpan: 1,
		},
		// 5. 左下小图2: 占 1列 x 1行
		{
			imgIdx: 4,
			col: 0,
			row: 3,
			colSpan: 1,
			rowSpan: 1,
		},
		// 6. 右下大图: 占 2列 x 2行
		{
			imgIdx: 5,
			col: 1,
			row: 2,
			colSpan: 2,
			rowSpan: 2,
		},
	];

	const layout = layoutConfigs.map((config) => {
		// 如果图片不够，自动从头开始遍历 (使用取模运算)
		const img = props.imageList[config.imgIdx % props.imageList.length];
		const itemWidth =
			config.colSpan * cellWidth + (config.colSpan - 1) * props.innerSpacing;
		const itemHeight =
			config.rowSpan * cellHeight + (config.rowSpan - 1) * props.innerSpacing;

		return {
			imagePath: img.imagePath,
			x: Math.ceil(
				props.outerSpacing + config.col * (cellWidth + props.innerSpacing),
			),
			y: Math.ceil(
				props.outerSpacing + config.row * (cellHeight + props.innerSpacing),
			),
			width: Math.ceil(itemWidth),
			height: Math.ceil(itemHeight),
		};
	});

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

			return {
				input: imageBuffer,
				left: Math.floor(item.x),
				top: Math.floor(item.y),
			};
		}),
	);

	const result = await canvas.composite(compositeOperations).png().toBuffer();

	// 重新裁剪，确保不超出画布范围
	return await sharp(result)
		.extract({
			left: 0,
			top: 0,
			width: setting.stWidth,
			height: setting.stHeight,
		})
		.toBuffer();
}
