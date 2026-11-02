import type { InferRouterInputs } from "@orpc/server";
import sharp, { type OverlayOptions } from "sharp";
import type { ORPC_制作详情 } from "#/orpc/router/orpc-制作详情";
import { setting } from "#/setting";
import { makeTextImage } from "../fun-图片功能/fun-制作文字图片2";
import { FUN_获取LOGO图片 } from "../fun-图片功能/fun-获取logo图片";
import { XQ_制作标题 } from "./xq-制作标题";

sharp.concurrency(4);

const BATCH_SIZE = 12;
const CONCURRENCY_LIMIT = 8;
const FONT_SIZE_NAME = 40;
const FONT_SIZE_SIZE = 35;

function logStep(scope: string, msg: string) {
	const now = new Date();
	const ts = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;
	console.log(`[${ts}][${scope}] ${msg}`);
}

type PreviewLayout = {
	width: number;
	totalHeight: number;
	titleImg: Buffer;
	titleHeight: number;
	logoImage: Buffer;
	logoWidth: number;
	logoHeight: number;
	nameFontColor: string;
	sizeFontColor: string;
	imgToLogoSpacing: number;
	logoToNameSpacing: number;
	nameToSizeSpacing: number;
	bottomSpacing: number;
	itemWidth: number;
	firstRowItemWidth: number;
	rows: number;
	remainder: number;
	borderRadius: number;
	outerSpacing: number;
	innerSpacing: number;
	rowMaxImgHeights: number[];
	rowTotalHeights: number[];
};

export async function XQ_计算预览图布局(props: InferRouterInputs<typeof ORPC_制作详情>): Promise<PreviewLayout> {
	const width = setting.xqWidth;
	const nameFontColor = "#333";
	const sizeFontColor = "#333";
	const imgToLogoSpacing = 60;
	const logoToNameSpacing = 30;
	const nameToSizeSpacing = 30;
	const bottomSpacing = 320;

	const [titleImg, logoImage] = await Promise.all([XQ_制作标题({ title: "素材预览图", desc: "* 素材内容以预览图为准" }), FUN_获取LOGO图片({ fillColor: nameFontColor, height: 60 })]);

	const [titleMeta, logoMeta] = await Promise.all([sharp(titleImg).metadata(), sharp(logoImage).metadata()]);
	const logoHeight = logoMeta.height || 0;
	const logoWidth = logoMeta.width || 0;
	const titleHeight = titleMeta.height || 0;

	const availableWidth = width - props.outerSpacing * 2;
	const rows = props.rows;
	const itemWidth = Math.floor((availableWidth - (rows - 1) * props.innerSpacing) / rows);
	const remainder = rows >= 2 ? props.previewImageList.length % rows : 0;
	const firstRowItemWidth = remainder > 0 ? Math.floor((availableWidth - (remainder - 1) * props.innerSpacing) / remainder) : itemWidth;

	const rowMaxImgHeights: number[] = [];
	const rowTotalHeights: number[] = [];

	let currentY = titleHeight;
	const list = props.previewImageList;
	let i = 0;
	let rowIdx = 0;

	while (i < list.length) {
		const take = i === 0 && remainder > 0 ? remainder : rows;
		const row = list.slice(i, i + take);

		let maxImgHeight = 0;

		for (let colIdx = 0; colIdx < row.length; colIdx++) {
			const isFirstRowRemainder = remainder > 0 && rowIdx === 0;
			const currentItemWidth = isFirstRowRemainder ? (colIdx < remainder ? firstRowItemWidth : itemWidth) : itemWidth;

			const img = row[colIdx];
			const ratio = img.imageRatio || (img.height > 0 ? img.width / img.height : 1);
			const targetImgHeight = Math.round(currentItemWidth / ratio);
			maxImgHeight = Math.max(maxImgHeight, targetImgHeight);
		}

		rowMaxImgHeights.push(maxImgHeight);

		const nameH = FONT_SIZE_NAME;
		const sizeH = FONT_SIZE_SIZE;
		const totalPerItem = maxImgHeight + imgToLogoSpacing + logoHeight + logoToNameSpacing + nameH + nameToSizeSpacing + sizeH;
		rowTotalHeights.push(totalPerItem);

		currentY += totalPerItem + bottomSpacing;
		i += take;
		rowIdx++;
	}

	const totalHeight = currentY + props.outerSpacing;

	return {
		width,
		totalHeight,
		titleImg,
		titleHeight,
		logoImage,
		logoWidth,
		logoHeight,
		nameFontColor,
		sizeFontColor,
		imgToLogoSpacing,
		logoToNameSpacing,
		nameToSizeSpacing,
		bottomSpacing,
		itemWidth,
		firstRowItemWidth,
		rows,
		remainder,
		borderRadius: props.borderRadius,
		outerSpacing: props.outerSpacing,
		innerSpacing: props.innerSpacing,
		rowMaxImgHeights,
		rowTotalHeights,
	};
}

async function processSingleImage(img: InferRouterInputs<typeof ORPC_制作详情>["previewImageList"][number], currentItemWidth: number, borderRadius: number): Promise<{ imgBuffer: Buffer; currentImgHeight: number } | null> {
	try {
		const originalMeta = await sharp(img.imagePath).metadata();
		const isSwapped = !!(originalMeta.orientation && originalMeta.orientation >= 5 && originalMeta.orientation <= 8);
		const origWidth = isSwapped ? originalMeta.height || img.height : originalMeta.width || img.width;
		const origHeight = isSwapped ? originalMeta.width || img.width : originalMeta.height || img.height;

		const ratio = origHeight > 0 ? origWidth / origHeight : 1;
		const currentImgHeight = Math.round(currentItemWidth / ratio);

		if (currentImgHeight === 0) {
			console.warn(`[制作预览图] 警告：图片 ${img.imagePath} 高度计算为0 已跳过。`);
			return null;
		}

		let pipeline = sharp(img.imagePath).rotate().resize(currentItemWidth, currentImgHeight);

		if (borderRadius > 0) {
			const maskSvg = Buffer.from(`<svg width="${currentItemWidth}" height="${currentImgHeight}"><rect x="0" y="0" width="${currentItemWidth}" height="${currentImgHeight}" rx="${borderRadius}" ry="${borderRadius}" fill="black"/></svg>`);
			pipeline = pipeline.composite([{ input: maskSvg, blend: "dest-in" }]);
		}

		const imgBuffer = await pipeline.png().toBuffer();
		return { imgBuffer, currentImgHeight };
	} catch (err) {
		console.error(`[制作预览图] 处理图片 ${img.imagePath} 出错:`, err);
		return null;
	}
}

async function composeTextBlock(img: InferRouterInputs<typeof ORPC_制作详情>["previewImageList"][number], layout: PreviewLayout, minWidth: number): Promise<{ blockBuffer: Buffer; blockWidth: number; blockHeight: number }> {
	const [nameImg, sizeImg] = await Promise.all([
		makeTextImage({
			text: img.materialName.toUpperCase(),
			fontWeight: "Light",
			fillColor: layout.nameFontColor,
			height: FONT_SIZE_NAME,
		}),
		makeTextImage({
			text: (() => {
				const ext = img.materialName.split(".").pop()?.toLowerCase();
				return ["ai", "eps"].includes(ext || "") ? "AI矢量素材" : `${img.width}×${img.height}(PX)`;
			})(),
			fontWeight: "Light",
			fillColor: layout.sizeFontColor,
			height: FONT_SIZE_SIZE,
		}),
	]);

	const [nameMeta, sizeMeta] = await Promise.all([sharp(nameImg).metadata(), sharp(sizeImg).metadata()]);
	const nameWidth = nameMeta.width || 0;
	const nameHeight = nameMeta.height || 0;
	const sizeWidth = sizeMeta.width || 0;
	const sizeHeight = sizeMeta.height || 0;

	const blockWidth = Math.max(minWidth, layout.logoWidth, nameWidth, sizeWidth);
	const blockHeight = layout.logoHeight + layout.logoToNameSpacing + nameHeight + layout.nameToSizeSpacing + sizeHeight;

	const logoLeft = Math.floor((blockWidth - layout.logoWidth) / 2);
	const nameTop = layout.logoHeight + layout.logoToNameSpacing;
	const sizeTop = nameTop + nameHeight + layout.nameToSizeSpacing;

	const blockBuffer = await sharp({
		create: {
			width: blockWidth,
			height: blockHeight,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		},
	})
		.composite([
			{ input: layout.logoImage, top: 0, left: logoLeft },
			{ input: nameImg, top: nameTop, left: Math.floor((blockWidth - nameWidth) / 2) },
			{ input: sizeImg, top: sizeTop, left: Math.floor((blockWidth - sizeWidth) / 2) },
		])
		.png()
		.toBuffer();

	return { blockBuffer, blockWidth, blockHeight };
}

function buildRowStarts(layout: PreviewLayout): number[] {
	const rowStarts: number[] = [];
	let y = layout.titleHeight;
	for (let r = 0; r < layout.rowMaxImgHeights.length; r++) {
		rowStarts.push(y);
		y += layout.rowTotalHeights[r] + layout.bottomSpacing;
	}
	return rowStarts;
}

export async function XQ_生成预览图固定层(layout: PreviewLayout): Promise<OverlayOptions[]> {
	return [{ input: layout.titleImg, top: 0, left: 0 }];
}

export async function* XQ_分批生成预览图Composites(props: InferRouterInputs<typeof ORPC_制作详情>, layout: PreviewLayout): AsyncGenerator<{ composites: OverlayOptions[]; batchIndex: number; totalBatches: number }> {
	const rowStarts = buildRowStarts(layout);
	const list = props.previewImageList;
	const totalBatches = Math.ceil(list.length / BATCH_SIZE);

	console.log(`[预览图布局] titleHeight=${layout.titleHeight}, rowStarts=${JSON.stringify(rowStarts)}, rowMaxImgHeights=${JSON.stringify(layout.rowMaxImgHeights)}, rowTotalHeights=${JSON.stringify(layout.rowTotalHeights)}, totalHeight=${layout.totalHeight}`);

	for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
		const startIdx = batchIdx * BATCH_SIZE;
		const endIdx = Math.min(startIdx + BATCH_SIZE, list.length);
		const batchList = list.slice(startIdx, endIdx);
		const batchComposites: OverlayOptions[] = [];

		logStep("制作预览图", `批次 ${batchIdx + 1}/${totalBatches} 开始：图片 ${startIdx + 1}-${endIdx}，并发=${CONCURRENCY_LIMIT}`);
		const batchT0 = Date.now();

		let cursor = 0;
		const workers = Array.from({ length: CONCURRENCY_LIMIT }, async () => {
			while (cursor < batchList.length) {
				const localIdx = cursor++;
				const globalIdx = startIdx + localIdx;
				const img = batchList[localIdx];

				let rowStart = layout.titleHeight;
				let row = 0;
				let rowCursor = 0;
				const total = list.length;
				let ii = 0;
				while (ii < total) {
					const take = ii === 0 && layout.remainder > 0 ? layout.remainder : layout.rows;
					if (globalIdx >= ii && globalIdx < ii + take) {
						row = rowCursor;
						break;
					}
					ii += take;
					rowCursor++;
				}
				rowStart = rowStarts[row];
				const colInRow = globalIdx - ii;
				const isFirstRowRemainder = layout.remainder > 0 && row === 0;
				const currentItemWidth = isFirstRowRemainder && colInRow < layout.remainder ? layout.firstRowItemWidth : layout.itemWidth;
				const x = layout.outerSpacing + colInRow * (currentItemWidth + layout.innerSpacing);

				const rowMaxImgHeight = layout.rowMaxImgHeights[row];

				const t0 = Date.now();
				logStep("制作预览图", `图片#${globalIdx + 1} 开始处理 ${img.materialName} row=${row} col=${colInRow} 宽=${currentItemWidth}`);

				const [processed, textBlock] = await Promise.all([processSingleImage(img, currentItemWidth, layout.borderRadius), composeTextBlock(img, layout, currentItemWidth)]);

				const { imgBuffer, currentImgHeight } = processed || {};
				const imgYOffset = rowMaxImgHeight - (currentImgHeight || 0);

				if (globalIdx === 0) {
					console.log(`[预览图#0调试] globalIdx=0, row=${row}, rowStart=${rowStart}, imgYOffset=${imgYOffset}, 图片top=${rowStart + imgYOffset}`);
				}

				if (imgBuffer) {
					batchComposites.push({
						input: imgBuffer,
						top: rowStart + imgYOffset,
						left: x,
					});
				}

				if (textBlock) {
					const textX = x - Math.floor((textBlock.blockWidth - currentItemWidth) / 2);
					const textY = rowStart + rowMaxImgHeight + layout.imgToLogoSpacing;
					batchComposites.push({ input: textBlock.blockBuffer, top: textY, left: textX });
				}

				logStep("制作预览图", `图片#${globalIdx + 1} 处理完成 ${Date.now() - t0}ms 图片=${imgBuffer ? "ok" : "失败"}, 当前composites=${batchComposites.length}`);
			}
		});
		await Promise.all(workers);

		logStep("制作预览图", `批次 ${batchIdx + 1}/${totalBatches} 生成完毕，耗时 ${Date.now() - batchT0}ms，图片 ${startIdx + 1}-${endIdx}，composites=${batchComposites.length}，即将交给分片写入`);

		yield { composites: batchComposites, batchIndex: batchIdx, totalBatches };
	}
}

export async function XQ_制作预览图(props: InferRouterInputs<typeof ORPC_制作详情>) {
	logStep("制作预览图", "开始：计算布局");
	const layout = await XQ_计算预览图布局(props);
	logStep("制作预览图", `布局完成 ${layout.width}×${layout.totalHeight}，图片数=${props.previewImageList.length}`);

	const composites: OverlayOptions[] = await XQ_生成预览图固定层(layout);
	logStep("制作预览图", `固定层完成，composites=${composites.length}`);

	for await (const batch of XQ_分批生成预览图Composites(props, layout)) {
		composites.push(...batch.composites);
	}

	logStep("制作预览图", `预处理完成: ${layout.width}×${layout.totalHeight}, composites=${composites.length}`);
	return { width: layout.width, totalHeight: layout.totalHeight, composites };
}
