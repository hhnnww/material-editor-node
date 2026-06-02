import type { InferRouterInputs } from "@orpc/server";
import sharp, { type OverlayOptions } from "sharp";
import type { ORPC_制作详情 } from "#/orpc/router/orpc-制作详情";
import { setting } from "#/setting";
import { XQ_制作标题 } from "./xq-制作标题";

export async function XQ_制作效果图(
	props: InferRouterInputs<typeof ORPC_制作详情>,
) {
	const width = setting.xqWidth;
	const titleImg = await XQ_制作标题({
		title: "素材效果图",
		desc: "* 此图片素材内不提供",
	});
	const titleMeta = await sharp(titleImg).metadata();

	const availableWidth = width - props.outerSpacing * 2;
	const itemWidth = Math.floor(
		(availableWidth - (props.rows - 1) * props.innerSpacing) / props.rows,
	);
	const remainder =
		props.rows >= 2 ? props.effectImageList.length % props.rows : 0;
	const firstRowItemWidth =
		remainder > 0
			? Math.floor(
					(availableWidth - (remainder - 1) * props.innerSpacing) / remainder,
				)
			: itemWidth;

	const composites: OverlayOptions[] = [];
	composites.push({ input: titleImg, top: 0, left: 0 });

	let currentY = titleMeta.height || 0;
	const rowGroups: {
		buffer: Buffer;
		height: number;
		width: number;
		itemWidthUsed: number;
	}[][] = [];

	// 1. 预处理所有图片，缩放到统一宽度
	let i = 0;
	while (i < props.effectImageList.length) {
		const take = i === 0 && remainder > 0 ? remainder : props.rows;
		const row = props.effectImageList.slice(i, i + take);
		const currentItemWidth =
			i === 0 && remainder > 0 ? firstRowItemWidth : itemWidth;
		i += take;

		const processedRow = await Promise.all(
			row.map(async (img) => {
				let buffer = await sharp(img.imagePath)
					.resize(currentItemWidth)
					.toBuffer();
				const meta = await sharp(buffer).metadata();

				if (props.borderRadius > 0) {
					const mask = Buffer.from(
						`<svg><rect x="0" y="0" width="${meta.width}" height="${meta.height}" rx="${props.borderRadius}" ry="${props.borderRadius}" /></svg>`,
					);
					buffer = await sharp(buffer)
						.composite([{ input: mask, blend: "dest-in" }])
						.png()
						.toBuffer();
				}

				return {
					buffer,
					height: meta.height || 0,
					width: meta.width || 0,
					itemWidthUsed: currentItemWidth,
				};
			}),
		);
		rowGroups.push(processedRow);
	}

	// 2. 计算每一行并排列（底部对齐）
	for (const row of rowGroups) {
		const maxHeight = Math.max(...row.map((img) => img.height));

		row.forEach((img, index) => {
			const x =
				props.outerSpacing + index * (img.itemWidthUsed + props.innerSpacing);
			// 底部对齐：当前行最大高度 - 图片自身高度
			const yOffset = maxHeight - img.height;

			composites.push({
				input: img.buffer,
				top: currentY + yOffset,
				left: x,
			});
		});

		currentY += maxHeight + props.innerSpacing;
	}

	const totalHeight = currentY + props.outerSpacing;

	return await sharp({
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
}
