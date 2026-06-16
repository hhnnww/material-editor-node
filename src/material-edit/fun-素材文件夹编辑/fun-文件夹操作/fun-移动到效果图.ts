import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export async function moveImagesToEffectFolder(
	materialPath: string,
	effectPath: string,
	thumbPath: string,
) {
	const imageFileList = FUN_递归遍历文件夹(
		materialPath,
		setting.imageSuffixList,
	);
	const imageMaxSize = setting.thumbImageMaxWidth;

	// 确保目标目录存在
	const thumbEffectPath = path.join(thumbPath, "效果图");
	if (!fs.existsSync(effectPath)) fs.mkdirSync(effectPath, { recursive: true });
	if (!fs.existsSync(thumbEffectPath))
		fs.mkdirSync(thumbEffectPath, { recursive: true });

	// 获取效果图目录中已有的最大数字编号
	const existingFiles = fs.readdirSync(effectPath);
	let maxNum = 0;
	existingFiles.forEach((file) => {
		const num = parseInt(path.basename(file, path.extname(file)), 10);
		if (!Number.isNaN(num)) maxNum = Math.max(maxNum, num);
	});

	let counter = maxNum + 1;

	for (const oldPath of imageFileList) {
		const ext = path.extname(oldPath);
		const newFileName = `${counter}${ext}`;
		const targetEffectPath = path.join(effectPath, newFileName);
		const targetThumbPath = path.join(thumbEffectPath, newFileName);

		try {
			// 1. 移动文件到效果图目录
			console.log(`正在移动: ${oldPath} -> ${targetEffectPath}`);
			fs.renameSync(oldPath, targetEffectPath);

			// 2. 使用 sharp 生成缩略图
			await sharp(targetEffectPath)
				.resize({
					width: imageMaxSize,
					height: imageMaxSize,
					fit: "inside",
					withoutEnlargement: true,
				})
				.toFile(targetThumbPath);

			counter++;
		} catch (error) {
			console.error(`处理图片失败: ${oldPath}`, error);
		}
	}
}
