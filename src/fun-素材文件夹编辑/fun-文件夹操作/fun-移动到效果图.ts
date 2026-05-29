import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export async function FUN_移动到效果图(
	materialPath: string,
	effectPath: string,
	thumbPath: string,
) {
	/**
	 * 把素材文件夹下的所有图片，移动到效果图文件夹的根目录，并且把图片重命名为 1.jpg 2.jpg 3.png 4.gif这样的
	 * 如果效果图里面已有图片，自增数字，保证不重名
	 * 素材文件夹：F:\小夕素材\11000-11999\11824\11824
	 * 效果图文件夹：F:\小夕素材\11000-11999\11824\效果图
	 * 素材文件夹图片：F:\小夕素材\11000-11999\11824\11824\1.jpg
	 * 或者 F:\小夕素材\11000-11999\11824\11824\232323\1.jpg
	 * 全部移动到效果图文件夹 F:\小夕素材\11000-11999\11824\效果图\1.jpg,F:\小夕素材\11000-11999\11824\效果图\2.jpg这样
	 * 移动过去之后，再把效果图图使用sharp缩小到最长边为imageMaxSize, 保存到缩略图
	 * 传入的缩略图文件夹为 F:\小夕素材\11000-11999\11824\缩略图
	 * 图片保存到 F:\小夕素材\11000-11999\11824\缩略图\效果图
	 * 保证同名同结构
	 */
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
