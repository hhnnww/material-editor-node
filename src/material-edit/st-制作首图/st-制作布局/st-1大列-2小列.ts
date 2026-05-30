import type { InferRouterInputs } from "@orpc/server";
import sharp from "sharp";
import type { ORPC_制作首图 } from "#/orpc/router/orpc-制作首图";
import { setting } from "#/setting";

export async function ST_1大列2小列(
	props: InferRouterInputs<typeof ORPC_制作首图>,
) {
	/**
	 * 左边1大列，占据图片60%空间，
	 * 右边分为2列，平均分
	 * 每列3张图片，把剩下的图片缩小裁剪后粘贴上去
	 * 如果图片不够，自动从图片列表第二张开始重新遍历
	 */
	const width = setting.stWidth;
	const height =
		props.style === "黑鲸"
			? setting.stHeight - setting.stHeijingHeight
			: setting.stHeight;

	const availableWidth = width - props.outerSpacing * 2;
	const availableHeight = height - props.outerSpacing * 2;

	// 1. 计算尺寸
	// 左侧大列占 60%
	const bigColWidth = Math.floor(
		(availableWidth - props.innerSpacing * 2) * 0.6,
	);
	// 右侧两列平分剩余空间
	const smallColWidth = Math.ceil(
		(availableWidth - bigColWidth - props.innerSpacing * 2) / 2,
	);
	// 右侧每列 3 张图，计算小图高度
	const smallItemHeight = Math.ceil(
		(availableHeight - props.innerSpacing * 2) / 3,
	);

	const layout: any[] = [];

	// 2. 放置左侧大图 (第一张)
	layout.push({
		imagePath: props.imageList[0].imagePath,
		x: props.outerSpacing,
		y: props.outerSpacing,
		width: Math.ceil(bigColWidth),
		height: Math.ceil(availableHeight),
	});

	// 3. 放置右侧两列小图 (从第二张图片开始循环)
	const remainingImages = props.imageList.slice(1);
	if (remainingImages.length === 0) {
		// 如果只有一张图，则后续全部重复使用第一张
		remainingImages.push(props.imageList[0]);
	}

	for (let col = 0; col < 2; col++) {
		for (let row = 0; row < 3; row++) {
			const index = col * 3 + row;
			const img = remainingImages[index % remainingImages.length];

			layout.push({
				imagePath: img.imagePath,
				x:
					props.outerSpacing +
					bigColWidth +
					props.innerSpacing +
					col * (smallColWidth + props.innerSpacing),
				y: Math.ceil(
					props.outerSpacing + row * (smallItemHeight + props.innerSpacing),
				),
				width: Math.ceil(smallColWidth),
				height: Math.ceil(smallItemHeight),
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
					fit: "cover",
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
