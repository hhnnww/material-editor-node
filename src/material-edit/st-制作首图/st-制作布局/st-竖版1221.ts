import type { InferRouterInputs } from "@orpc/server";
import sharp from "sharp";
import type { ORPC_制作首图 } from "#/orpc/router/orpc-制作首图";
import { setting } from "#/setting";

export async function ST_竖版1221(
	props: InferRouterInputs<typeof ORPC_制作首图>,
) {
	/**
	 * 分为3大列，每一列均分宽度，每列内部分为上下两部分
	 * 第一列：上面1张大图，下面2张横向排列的小图
	 * 第二列：上面2张横向排列的小图，下面1张大图
	 * 第三列：上面1张大图，下面2张横向排列的小图
	 * 大图占 2/3 高度，小图占 1/3 高度
	 */
	const width = setting.stWidth;
	const height =
		props.style === "黑鲸"
			? setting.stHeight - setting.stHeijingHeight
			: setting.stHeight;

	const availableWidth = width - props.outerSpacing * 2;
	const availableHeight = height - props.outerSpacing * 2;

	// 3列均分宽度
	const colWidth = (availableWidth - props.innerSpacing * 2) / 3;
	// 上下分割比例：大图占 2/3，小图占 1/3
	const bigRowHeight = (availableHeight - props.innerSpacing) * 0.66;
	const smallRowHeight = availableHeight - props.innerSpacing - bigRowHeight;
	const halfColWidth = (colWidth - props.innerSpacing) / 2;

	const layoutConfigs = [
		// --- 第一列 ---
		// 1. 第一列上面大图
		{
			imgIdx: 0,
			x: 0,
			y: 0,
			w: colWidth,
			h: bigRowHeight,
		},
		// 2. 第一列下面左小图
		{
			imgIdx: 1,
			x: 0,
			y: bigRowHeight + props.innerSpacing,
			w: halfColWidth,
			h: smallRowHeight,
		},
		// 3. 第一列下面右小图
		{
			imgIdx: 2,
			x: halfColWidth + props.innerSpacing,
			y: bigRowHeight + props.innerSpacing,
			w: halfColWidth,
			h: smallRowHeight,
		},

		// --- 第二列 ---
		// 4. 第二列上面左小图
		{
			imgIdx: 3,
			x: colWidth + props.innerSpacing,
			y: 0,
			w: halfColWidth,
			h: smallRowHeight,
		},
		// 5. 第二列上面右小图
		{
			imgIdx: 4,
			x: colWidth + props.innerSpacing + halfColWidth + props.innerSpacing,
			y: 0,
			w: halfColWidth,
			h: smallRowHeight,
		},
		// 6. 第二列下面大图
		{
			imgIdx: 5,
			x: colWidth + props.innerSpacing,
			y: smallRowHeight + props.innerSpacing,
			w: colWidth,
			h: bigRowHeight,
		},

		// --- 第三列 ---
		// 7. 第三列上面大图
		{
			imgIdx: 6,
			x: (colWidth + props.innerSpacing) * 2,
			y: 0,
			w: colWidth,
			h: bigRowHeight,
		},
		// 8. 第三列下面左小图
		{
			imgIdx: 7,
			x: (colWidth + props.innerSpacing) * 2,
			y: bigRowHeight + props.innerSpacing,
			w: halfColWidth,
			h: smallRowHeight,
		},
		// 9. 第三列下面右小图
		{
			imgIdx: 8,
			x:
				(colWidth + props.innerSpacing) * 2 + halfColWidth + props.innerSpacing,
			y: bigRowHeight + props.innerSpacing,
			w: halfColWidth,
			h: smallRowHeight,
		},
	];

	const layout = layoutConfigs.map((item) => {
		const img = props.imageList[item.imgIdx % props.imageList.length];
		return {
			imagePath: img.imagePath,
			x: Math.ceil(props.outerSpacing + item.x),
			y: Math.ceil(props.outerSpacing + item.y),
			width: Math.ceil(item.w),
			height: Math.ceil(item.h),
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
				left: item.x,
				top: item.y,
			};
		}),
	);

	const result = await canvas.composite(compositeOperations).png().toBuffer();

	return await sharp(result)
		.extract({
			left: 0,
			top: 0,
			width: setting.stWidth,
			height: setting.stHeight,
		})
		.toBuffer();
}
