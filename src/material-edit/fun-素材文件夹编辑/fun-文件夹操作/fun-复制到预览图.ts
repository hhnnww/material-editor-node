import { existsSync } from "node:fs"; // 仅保留 existsSync 用于超快速的状态检查
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

/**
 * 复制到预览图并生成缩略图（高性能并发控制版）
 */
export async function FUN_复制到预览图(materialPath: string, previewPath: string, thumbPath: string) {
	const thumbMaxSize = setting.thumbImageMaxWidth;
	const materialImageList = FUN_递归遍历文件夹(materialPath, setting.imageSuffixList);

	const thumbPreviewPath = path.join(thumbPath, "预览图");

	// 💡 优化点 1：将已经创建过的文件夹路径缓存在内存中，避免频繁调用磁盘创建命令
	const createdDirs = new Set<string>();

	// 💡 优化点 2：建立工作队列，控制并发数。推荐 8~16（视你的 CPU 核心数和 SSD 硬盘而定）
	const CONCURRENCY_LIMIT = 8;
	let currentIndex = 0;

	async function worker() {
		while (currentIndex < materialImageList.length) {
			const oldPath = materialImageList[currentIndex++]; // 抢占下一个任务
			if (!oldPath) continue;

			// 如果素材图的父文件夹的 stem 是 Links，则不进行复制操作
			const parentDirName = path.basename(path.dirname(oldPath));
			if (parentDirName.toLowerCase() === "links") {
				continue;
			}

			// 计算相对路径以保持结构
			const relativePath = path.relative(materialPath, oldPath);
			const targetPreviewPath = path.join(previewPath, relativePath);
			const targetThumbPath = path.join(thumbPreviewPath, relativePath);

			const previewDir = path.dirname(targetPreviewPath);
			const thumbDir = path.dirname(targetThumbPath);

			try {
				// 1. 复制文件到预览图目录 (使用 existsSync 快速判断，真写入时采用异步 promises)
				if (!existsSync(targetPreviewPath)) {
					if (!createdDirs.has(previewDir) && !existsSync(previewDir)) {
						await fs.mkdir(previewDir, { recursive: true });
						createdDirs.add(previewDir);
					}
					console.log(`[复制中] -> ${targetPreviewPath}`);
					await fs.copyFile(oldPath, targetPreviewPath);
				}

				// 2. 使用 sharp 生成缩略图 (全异步流处理)
				if (!existsSync(targetThumbPath)) {
					if (!createdDirs.has(thumbDir) && !existsSync(thumbDir)) {
						await fs.mkdir(thumbDir, { recursive: true });
						createdDirs.add(thumbDir);
					}
					console.log(`[生成缩略图] -> ${targetThumbPath}`);

					// 💡 优化点 3：直接从源路径 oldPath 读取生成缩略图，避免等待 targetPreviewPath 写入完成，完全并行
					await sharp(oldPath)
						.rotate() // 顺便防御一下 EXIF 导致的缩略图方向错误
						.resize({
							width: thumbMaxSize,
							height: thumbMaxSize,
							fit: "inside",
							withoutEnlargement: true,
						})
						.toFile(targetThumbPath);
				}
			} catch (error) {
				console.error(`处理预览图失败: ${oldPath}`, error);
			}
		}
	}

	// 启动多通道并发执行
	console.log(`[开始并行处理] 开启 ${CONCURRENCY_LIMIT} 个并发线程处理 ${materialImageList.length} 张图片...`);
	const workers = Array.from({ length: CONCURRENCY_LIMIT }, () => worker());
	await Promise.all(workers);

	console.log("[并行处理完成] 🎉 所有预览图与缩略图处理完毕！");
	return true;
}
