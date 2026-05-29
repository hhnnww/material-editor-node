import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export async function FUN_从效果图生成到缩略图(
	effectPath: string,
	thumbPath: string,
) {
	/**
	 * 效果图目录 F:\泡泡素材\3000-3999\3675\效果图
	 * 缩略图目录：F:\泡泡素材\3000-3999\3675\缩略图
	 * 效果图对应的缩略图目录应该是 F:\泡泡素材\3000-3999\3675\缩略图\效果图
	 * 构建对应的缩略图文件路径，如果缩略图不存在
	 * 则使用sharp缩小到下面的尺寸，保存图片到缩略图
	 */
	const thumbImageMaxSize = setting.thumbImageMaxWidth;
	const effectImageList = FUN_递归遍历文件夹(
		effectPath,
		setting.imageSuffixList,
	);

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
