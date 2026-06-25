import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

/**
 * 从效果图文件夹生成缩略图
 * @param effectPath 效果图文件夹路径
 * @param thumbPath 缩略图根文件夹路径
 */
export async function generateThumbnailsFromEffects(effectPath: string, thumbPath: string) {
	const thumbImageMaxSize = setting.thumbImageMaxWidth; // 缩略图最大宽度
	const effectImageList = FUN_递归遍历文件夹(effectPath, setting.imageSuffixList);

	const thumbEffectPath = path.join(thumbPath, "效果图");

	for (const effectImg of effectImageList) {
		const relativePath = path.relative(effectPath, effectImg);
		const targetThumbPath = path.join(thumbEffectPath, relativePath);

		if (fs.existsSync(targetThumbPath)) {
			continue;
		}

		const targetDir = path.dirname(targetThumbPath);
		if (!fs.existsSync(targetDir)) {
			fs.mkdirSync(targetDir, { recursive: true });
		}

		try {
			console.log(`正在从效果图生成缩略图: ${effectImg} -> ${targetThumbPath}`);
			await sharp(effectImg)
				.resize({
					width: thumbImageMaxSize,
					height: thumbImageMaxSize,
					fit: "inside",
					withoutEnlargement: true,
				})
				.toFile(targetThumbPath);
		} catch (error) {
			console.error(`生成效果图缩略图失败: ${effectImg}`, error);
		}
	}
}
