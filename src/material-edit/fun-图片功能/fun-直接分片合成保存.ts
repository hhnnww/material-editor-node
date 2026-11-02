import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { FUN_保存图片_Core } from "./fun-保存图片";

const SLICE_HEIGHT = 2000;
const SLICE_CONCURRENCY = 4;
const OVERLAY_CONCURRENCY = 8;
const overlayMetaCache = new WeakMap<OverlayOptions, { width: number; height: number }>();
function logStep(scope: string, msg: string) {
	const now = new Date();
	const ts = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;
	console.log(`[${ts}][${scope}] ${msg}`);
}
async function getOverlaySize(c: OverlayOptions): Promise<{ width: number; height: number }> {
	const cached = overlayMetaCache.get(c);
	if (cached) return cached;
	const meta = await sharp(c.input as Buffer).metadata();
	const size = { width: meta.width ?? 0, height: meta.height ?? 0 };
	overlayMetaCache.set(c, size);
	return size;
}
async function runPool<T, R>(items: T[], concurrency: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let cursor = 0;
	const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
		while (cursor < items.length) {
			const idx = cursor++;
			try {
				results[idx] = await fn(items[idx], idx);
			} catch (err) {
				logStep("runPool", `任务 index=${idx} 抛错: ${err instanceof Error ? err.message : String(err)}`);
				throw err;
			}
		}
	});
	const settled = await Promise.allSettled(workers);
	const failed = settled.find((r) => r.status === "rejected");
	if (failed && failed.status === "rejected") {
		throw failed.reason;
	}
	return results;
}
function getDesktopUploadDir() {
	const desktopPath = path.join(os.homedir(), "Desktop");
	const uploadDir = path.join(desktopPath, "UPLOAD");
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}
	return uploadDir;
}
function slicePath(uploadDir: string, sliceNum: number) {
	return path.join(uploadDir, `xq_${sliceNum}.jpg`);
}
async function clipCompositeToSlice(c: OverlayOptions, top: number, height: number, sliceWidth: number): Promise<OverlayOptions | null> {
	const cTop = c.top ?? 0;
	const cLeft = c.left ?? 0;
	if (cTop >= top + height) return null;
	if (cLeft >= sliceWidth) return null;
	const input = c.input as Buffer;
	const { width: imgWidth, height: imgHeight } = await getOverlaySize(c);
	if (imgHeight === 0 || imgWidth === 0) return null;
	if (cTop + imgHeight <= top) return null;
	const cropTop = Math.max(0, top - cTop);
	const cropLeft = Math.max(0, -cLeft);
	const cropWidth = Math.min(imgWidth - cropLeft, sliceWidth - Math.max(0, cLeft));
	const cropHeight = Math.min(imgHeight - cropTop, height - Math.max(0, cTop - top));
	if (cropWidth <= 0 || cropHeight <= 0) return null;
	if (cropTop === 0 && cropLeft === 0 && cropWidth === imgWidth && cropHeight === imgHeight) {
		return { ...c, top: cTop - top, left: Math.max(0, cLeft) };
	}
	const clipped = await sharp(input).extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight }).png({ compressionLevel: 1 }).toBuffer();
	return {
		input: clipped,
		top: Math.max(0, cTop - top),
		left: Math.max(0, cLeft),
	};
}
async function collectSliceOverlays(batchComposites: OverlayOptions[], top: number, height: number, sliceWidth: number): Promise<OverlayOptions[]> {
	const candidates = batchComposites.filter((c) => (c.top ?? 0) < top + height && (c.left ?? 0) < sliceWidth);
	const clippedList = await runPool(candidates, OVERLAY_CONCURRENCY, (c) => clipCompositeToSlice(c, top, height, sliceWidth));
	return clippedList.filter((c): c is OverlayOptions => c !== null);
}
async function readSlice(filePath: string): Promise<Buffer> {
	if (!fs.existsSync(filePath)) {
		throw new Error(`分片文件不存在: ${filePath}`);
	}
	const buf = await sharp(filePath).toBuffer();
	if (buf.length === 0) {
		throw new Error(`分片文件读取为空: ${filePath}`);
	}
	return buf;
}
async function writeToSlice(filePath: string, pipeline: sharp.Sharp) {
	const tmpPath = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;
	try {
		await pipeline.toFile(tmpPath);
		fs.renameSync(tmpPath, filePath);
	} catch (err) {
		try {
			if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
		} catch {}
		throw err;
	}
}
export async function FUN_初始化分片(width: number, totalHeight: number, fixedComposites: OverlayOptions[], startNum: number): Promise<number> {
	const uploadDir = getDesktopUploadDir();
	const parts = Math.ceil(totalHeight / SLICE_HEIGHT);
	logStep("分片初始化", `开始，共 ${parts} 片，固定元素数=${fixedComposites.length}`);
	for (let i = 0; i < parts; i++) {
		const top = i * SLICE_HEIGHT;
		const height = Math.min(SLICE_HEIGHT, totalHeight - top);
		const sliceNum = startNum + i;
		const filePath = slicePath(uploadDir, sliceNum);
		logStep("分片初始化", `第 ${sliceNum} 片 开始裁剪固定元素 top=${top} height=${height}`);
		const shifted = await collectSliceOverlays(fixedComposites, top, height, width);
		logStep("分片初始化", `第 ${sliceNum} 片 裁剪完成 命中=${shifted.length} 个，开始创建底图并写盘`);
		await writeToSlice(
			filePath,
			sharp({
				create: {
					width,
					height,
					channels: 4,
					background: { r: 255, g: 255, b: 255, alpha: 1 },
				},
			})
				.composite(shifted)
				.jpeg({ quality: 90 }),
		);
		logStep("分片初始化", `第 ${sliceNum} 片 写盘完成 (进度 ${i + 1}/${parts}) top=${top} height=${height} 固定元素=${shifted.length}`);
	}
	logStep("分片初始化", `全部完成，共 ${parts} 片`);
	return parts;
}
export async function FUN_增量写入分片(width: number, totalHeight: number, batchComposites: OverlayOptions[], startNum: number): Promise<void> {
	const uploadDir = getDesktopUploadDir();
	const parts = Math.ceil(totalHeight / SLICE_HEIGHT);
	logStep("分片增量写入", `进入：本批 ${batchComposites.length} 个composite，待检查 ${parts} 片，逐片并发上限=${SLICE_CONCURRENCY}`);
	const sliceIndexes = Array.from({ length: parts }, (_, i) => i);
	let finishedSlices = 0;
	const touched = await runPool(sliceIndexes, SLICE_CONCURRENCY, async (i) => {
		const top = i * SLICE_HEIGHT;
		const height = Math.min(SLICE_HEIGHT, totalHeight - top);
		const sliceNum = startNum + i;
		const filePath = slicePath(uploadDir, sliceNum);
		logStep("分片增量写入", `第 ${sliceNum} 片 开始裁剪 top=${top} height=${height}`);
		const shifted = await collectSliceOverlays(batchComposites, top, height, width);
		if (shifted.length === 0) {
			finishedSlices++;
			logStep("分片增量写入", `第 ${sliceNum} 片 无内容跳过 (进度 ${finishedSlices}/${parts})`);
			return false;
		}
		logStep("分片增量写入", `第 ${sliceNum} 片 裁剪完成 命中=${shifted.length} 个，开始读取现有 JPEG`);
		const readT0 = Date.now();
		const existingBuffer = await readSlice(filePath);
		logStep("分片增量写入", `第 ${sliceNum} 片 读取完成 ${existingBuffer.length} 字节 耗时=${Date.now() - readT0}ms，开始合成并写盘`);
		const writeT0 = Date.now();
		await writeToSlice(filePath, sharp(existingBuffer).composite(shifted).jpeg({ quality: 90 }));
		finishedSlices++;
		logStep("分片增量写入", `第 ${sliceNum} 片 写盘完成 耗时=${Date.now() - writeT0}ms (进度 ${finishedSlices}/${parts})`);
		return true;
	});
	const touchedSlices = touched.filter(Boolean).length;
	logStep("分片增量写入", `结束：本批 ${batchComposites.length} 个composite, 涉及 ${touchedSlices} 片`);
}
export async function FUN_最终加水印(width: number, totalHeight: number, startNum: number): Promise<void> {
	const uploadDir = getDesktopUploadDir();
	const parts = Math.ceil(totalHeight / SLICE_HEIGHT);
	logStep("分片最终", `开始加水印，共 ${parts} 片`);
	const sliceIndexes = Array.from({ length: parts }, (_, i) => i);
	let finishedSlices = 0;
	await runPool(sliceIndexes, SLICE_CONCURRENCY, async (i) => {
		const height = Math.min(SLICE_HEIGHT, totalHeight - i * SLICE_HEIGHT);
		const sliceNum = startNum + i;
		const filePath = slicePath(uploadDir, sliceNum);
		logStep("分片最终", `第 ${sliceNum} 片 开始读取 height=${height}`);
		const readT0 = Date.now();
		const existingBuffer = await readSlice(filePath);
		logStep("分片最终", `第 ${sliceNum} 片 读取完成 ${existingBuffer.length} 字节 耗时=${Date.now() - readT0}ms，开始合成水印`);
		const writeT0 = Date.now();
		const baseImage = sharp(existingBuffer);
		await FUN_保存图片_Core(baseImage, width, height, filePath, true);
		finishedSlices++;
		logStep("分片最终", `第 ${sliceNum} 片加水印完成 height=${height} 耗时=${Date.now() - writeT0}ms (进度 ${finishedSlices}/${parts})`);
	});
	logStep("分片最终", "全部片加水印结束");
}
export async function FUN_直接分片合成保存(width: number, totalHeight: number, composites: OverlayOptions[], startNum: number): Promise<number> {
	const parts = Math.ceil(totalHeight / SLICE_HEIGHT);
	console.log(`[直接分片合成] ${width}×${totalHeight}, 分片数: ${parts}`);
	const uploadDir = getDesktopUploadDir();
	for (let i = 0; i < parts; i++) {
		const top = i * SLICE_HEIGHT;
		const height = Math.min(SLICE_HEIGHT, totalHeight - top);
		const sliceNum = startNum + i;
		const outputPath = slicePath(uploadDir, sliceNum);
		const shifted = await collectSliceOverlays(composites, top, height, width);
		console.log(`[直接分片合成] 第 ${sliceNum} 片, top=${top}, height=${height}, composites=${shifted.length}`);
		const slicePipeline = sharp({
			create: {
				width,
				height,
				channels: 4,
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			},
		}).composite(shifted);
		await FUN_保存图片_Core(slicePipeline, width, height, outputPath, true);
	}
	return startNum + parts;
}
