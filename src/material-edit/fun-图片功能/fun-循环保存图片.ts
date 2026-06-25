import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { FUN_保存图片_Core } from "./fun-保存图片";

export async function FUN_循环保存图片(im: Buffer<ArrayBufferLike>, startNum: number) {
	const itemHeight = 2000;

	// 💡 优化点 1：只初始化一次 Sharp 实例并预载入数据
	const basePipeline = sharp(im);
	const metadata = await basePipeline.metadata();

	const totalHeight = metadata.height || 0;
	const width = metadata.width || 0;
	const parts = Math.ceil(totalHeight / itemHeight);

	console.log(`[长图切片] 总高度: ${totalHeight}, 分片数量: ${parts}`);

	const desktopPath = path.join(os.homedir(), "Desktop");
	const uploadDir = path.join(desktopPath, "UPLOAD");

	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}

	// 准备所有的切片任务信息
	const tasks = Array.from({ length: parts }, (_, i) => {
		const top = i * itemHeight;
		const height = Math.min(itemHeight, totalHeight - top);
		const currentStart = startNum + i;
		const outputPath = path.join(uploadDir, `xq_${currentStart}.jpg`);
		return { top, height, currentStart, outputPath, index: i };
	});

	// 控制并发数为 4，既能充分利用 CPU/IO，又不会耗尽内存
	const limit = 4;
	const executing = new Set<Promise<void>>();
	const promises: Promise<void>[] = [];

	for (const task of tasks) {
		const p = (async () => {
			try {
				// 💡 使用 .clone() 派生当前切片管道，并直接进行合成与文件写入，完全消除了 PNG 中间转换开销
				const slicePipeline = basePipeline.clone().extract({ left: 0, top: task.top, width, height: task.height });

				await FUN_保存图片_Core(slicePipeline, width, task.height, task.outputPath, true);
			} catch (error) {
				console.error(`[长图切片] 切割或保存第 ${task.index} 片 (xq_${task.currentStart}) 失败:`, error);
			}
		})();

		promises.push(p);

		if (limit < tasks.length) {
			const e: Promise<void> = p.then(() => {
				executing.delete(e);
			});
			executing.add(e);
			if (executing.size >= limit) {
				await Promise.race(executing);
			}
		}
	}

	await Promise.all(promises);

	return startNum + parts;
}
