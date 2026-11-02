import type { InferRouterInputs } from "@orpc/server";
import sharp, { type OverlayOptions } from "sharp";
import type { ORPC_制作详情 } from "#/orpc/router/orpc-制作详情";
import { setting } from "#/setting";
import { XQ_制作标题 } from "./xq-制作标题";

sharp.concurrency(4);

const BATCH_SIZE = 12;
const IMG_CONCURRENCY = 6;

function logStep(scope: string, msg: string) {
	const now = new Date();
	const ts = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;
	console.log(`[${ts}][${scope}] ${msg}`);
}

type EffectLayout = {
	width: number;
	totalHeight: number;
	titleImg: Buffer;
	titleHeight: number;
	itemWidth: number;
	firstRowItemWidth: number;
	rows: number;
	remainder: number;
	innerSpacing: number;
	outerSpacing: number;
	borderRadius: number;
	rowHeights: number[];
	rowStarts: number[];
};

export async function XQ_计算效果图布局(props: InferRouterInputs<typeof ORPC_制作详情>): Promise<EffectLayout> {
	const width = setting.xqWidth;
	const titleImg = await XQ_制作标题({ title: "素材效果图", desc: "* 此图片素材内不提供" });
	const titleMeta = await sharp(titleImg).metadata();
	const titleHeight = titleMeta.height || 0;

	const availableWidth = width - props.outerSpacing * 2;
	const rows = props.rows;
	const itemWidth = Math.floor((availableWidth - (rows - 1) * props.innerSpacing) / rows);
	const remainder = rows >= 2 ? props.effectImageList.length % rows : 0;
	const firstRowItemWidth = remainder > 0 ? Math.floor((availableWidth - (remainder - 1) * props.innerSpacing) / remainder) : itemWidth;

	const rowHeights: number[] = [];
	const rowStarts: number[] = [];

	let y = titleHeight;
	let i = 0;
	let rowIdx = 0;
	const list = props.effectImageList;

	while (i < list.length) {
		const take = i === 0 && remainder > 0 ? remainder : rows;
		const row = list.slice(i, i + take);

		let maxHeight = 0;
		for (const img of row) {
			const isFirstRowRemainder = remainder > 0 && rowIdx === 0;
			const colIdx = row.indexOf(img);
			const currentItemWidth = isFirstRowRemainder ? (colIdx < remainder ? firstRowItemWidth : itemWidth) : itemWidth;
			const ratio = img.imageRatio || (img.height > 0 ? img.width / img.height : 1);
			const targetHeight = Math.round(currentItemWidth / ratio);
			maxHeight = Math.max(maxHeight, targetHeight);
		}

		rowStarts.push(y);
		rowHeights.push(maxHeight);
		y += maxHeight + props.innerSpacing;
		i += take;
		rowIdx++;
	}

	const totalHeight = y + props.outerSpacing;

	return {
		width,
		totalHeight,
		titleImg,
		titleHeight,
		itemWidth,
		firstRowItemWidth,
		rows,
		remainder,
		innerSpacing: props.innerSpacing,
		outerSpacing: props.outerSpacing,
		borderRadius: props.borderRadius,
		rowHeights,
		rowStarts,
	};
}

function findRowAndCol(globalIdx: number, total: number, rows: number, remainder: number): { row: number; colInRow: number } {
	let i = 0;
	let row = 0;
	while (i < total) {
		const take = i === 0 && remainder > 0 ? remainder : rows;
		if (globalIdx >= i && globalIdx < i + take) {
			return { row, colInRow: globalIdx - i };
		}
		i += take;
		row++;
	}
	return { row: 0, colInRow: globalIdx };
}

export async function XQ_生成效果图固定层(layout: EffectLayout): Promise<OverlayOptions[]> {
	return [{ input: layout.titleImg, top: 0, left: 0 }];
}

export async function* XQ_分批生成效果图Composites(props: InferRouterInputs<typeof ORPC_制作详情>, layout: EffectLayout): AsyncGenerator<{ composites: OverlayOptions[]; batchIndex: number; totalBatches: number }> {
	const list = props.effectImageList;
	const totalBatches = Math.ceil(list.length / BATCH_SIZE);

	for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
		const startIdx = batchIdx * BATCH_SIZE;
		const endIdx = Math.min(startIdx + BATCH_SIZE, list.length);
		const batchList = list.slice(startIdx, endIdx);
		const batchComposites: OverlayOptions[] = [];

		logStep("制作效果图", `批次 ${batchIdx + 1}/${totalBatches} 开始：图片 ${startIdx + 1}-${endIdx}，并发=${IMG_CONCURRENCY}`);
		const batchT0 = Date.now();

		const processed = await workerPool(batchList, IMG_CONCURRENCY, async (img, localIdx) => {
			const globalIdx = startIdx + localIdx;
			const { row, colInRow } = findRowAndCol(globalIdx, list.length, layout.rows, layout.remainder);

			const isFirstRowRemainder = layout.remainder > 0 && row === 0;
			const currentItemWidth = isFirstRowRemainder && colInRow < layout.remainder ? layout.firstRowItemWidth : layout.itemWidth;

			const ratio = img.imageRatio || (img.height > 0 ? img.width / img.height : 1);
			const targetHeight = Math.round(currentItemWidth / ratio);

			const t0 = Date.now();
			logStep("制作效果图", `图片#${globalIdx + 1} 开始处理 row=${row} col=${colInRow} 尺寸=${currentItemWidth}×${targetHeight}`);

			let pipeline = sharp(img.imagePath).resize(currentItemWidth, targetHeight);

			if (layout.borderRadius > 0) {
				const mask = Buffer.from(`<svg><rect x="0" y="0" width="${currentItemWidth}" height="${targetHeight}" rx="${layout.borderRadius}" ry="${layout.borderRadius}"/></svg>`);
				pipeline = pipeline.composite([{ input: mask, blend: "dest-in" }]);
			}

			const buffer = await pipeline.png().toBuffer();
			logStep("制作效果图", `图片#${globalIdx + 1} 处理完成 ${Date.now() - t0}ms`);
			return { buffer, height: targetHeight, itemWidthUsed: currentItemWidth, row, colInRow, globalIdx };
		});

		for (const item of processed) {
			if (!item) continue;

			const rowStart = layout.rowStarts[item.row];
			const rowMaxHeight = layout.rowHeights[item.row];
			const yOffset = rowMaxHeight - item.height;
			const x = layout.outerSpacing + item.colInRow * (item.itemWidthUsed + layout.innerSpacing);

			batchComposites.push({
				input: item.buffer,
				top: rowStart + yOffset,
				left: x,
			});
		}

		logStep("制作效果图", `批次 ${batchIdx + 1}/${totalBatches} 生成完毕，耗时 ${Date.now() - batchT0}ms，图片 ${startIdx + 1}-${endIdx}，composites=${batchComposites.length}，即将交给分片写入`);
		yield { composites: batchComposites, batchIndex: batchIdx, totalBatches };
	}
}

async function workerPool<T, R>(items: T[], concurrency: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let cursor = 0;
	const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
		while (cursor < items.length) {
			const idx = cursor++;
			results[idx] = await fn(items[idx], idx);
		}
	});
	await Promise.all(workers);
	return results;
}

export async function XQ_制作效果图(props: InferRouterInputs<typeof ORPC_制作详情>) {
	const layout = await XQ_计算效果图布局(props);
	const composites: OverlayOptions[] = await XQ_生成效果图固定层(layout);

	for await (const batch of XQ_分批生成效果图Composites(props, layout)) {
		composites.push(...batch.composites);
	}

	console.log(`[制作效果图] 预处理完成: ${layout.width}×${layout.totalHeight}, composites=${composites.length}`);
	return { width: layout.width, totalHeight: layout.totalHeight, composites };
}
