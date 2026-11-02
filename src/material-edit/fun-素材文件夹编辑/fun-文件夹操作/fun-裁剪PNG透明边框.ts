import fs from "node:fs";
import sharp from "sharp";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

/**
 * 裁剪PNG图片的透明边框
 * @param materialPath 素材文件夹路径
 */
export async function FUN_裁剪PNG透明边框(materialPath: string) {
	const pngFileList = FUN_递归遍历文件夹(materialPath, [".png"]);
	const concurrencyLimit = 10; // 同时处理10张图片

	const tasks = pngFileList.map(async (imgPath) => {
		try {
			const image = sharp(imgPath);
			const metadata = await image.metadata();

			if (metadata.hasAlpha) {
				const { info } = await image.trim({ threshold: 10 }).toBuffer({ resolveWithObject: true });

				if (info.width !== metadata.width || info.height !== metadata.height) {
					const buffer = await sharp(imgPath).trim({ threshold: 10 }).png().toBuffer();

					await fs.promises.writeFile(`${imgPath}.tmp`, buffer);
					fs.renameSync(`${imgPath}.tmp`, imgPath);
					console.log(`透明边框裁剪完成: ${imgPath} (${metadata.width}x${metadata.height} -> ${info.width}x${info.height})`);
				}
			}
		} catch (error) {
			console.error(`裁剪透明边框失败: ${imgPath}`, error);
		}
	});

	// 使用简单的分批并行处理
	for (let i = 0; i < tasks.length; i += concurrencyLimit) {
		await Promise.all(tasks.slice(i, i + concurrencyLimit));
	}
}
