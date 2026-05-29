import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export async function FUN_复制到预览图(
	materialPath: string,
	previewPath: string,
	thumbPath: string,
) {
	/**
	 * 把素材图按照他在素材目录中的同结构复制到预览图文件夹
	 * 素材文件夹:F:\小夕素材\11000-11999\11824\11824
	 * 预览图文件夹：F:\小夕素材\11000-11999\11824\预览图
	 * 缩略图文件夹：F:\小夕素材\11000-11999\11824\缩略图
	 * 图片复制到预览图文件夹之后，使用sharpm缩小图片最长边为thumbMaxSize，保存到缩略图文件夹
	 * 保存的路径 是 F:\小夕素材\11000-11999\11824\缩略图\预览图
	 * 也要保持结构一致 素材图片复制到预览图 保持文件夹结构一致
	 * 预览图缩小保存到缩略图文件夹内的预览图也要文件结构一致
	 */
	const thumbMaxSize = setting.thumbImageMaxWidth;
	const materialImageList = FUN_递归遍历文件夹(
		materialPath,
		setting.imageSuffixList,
	);

	const thumbPreviewPath = path.join(thumbPath, "预览图");

	for (const oldPath of materialImageList) {
		// 如果素材图的父文件夹的stem是Links，则不进行复制操作
		const parentDirName = path.basename(path.dirname(oldPath));
		if (parentDirName.toLowerCase() === "links") {
			continue;
		}

		// 计算相对路径以保持结构
		const relativePath = path.relative(materialPath, oldPath);
		const targetPreviewPath = path.join(previewPath, relativePath);
		const targetThumbPath = path.join(thumbPreviewPath, relativePath);

		// 确保目标目录存在
		const previewDir = path.dirname(targetPreviewPath);
		const thumbDir = path.dirname(targetThumbPath);

		try {
			// 1. 复制文件到预览图目录 (如果不存在)
			if (!fs.existsSync(targetPreviewPath)) {
				if (!fs.existsSync(previewDir))
					fs.mkdirSync(previewDir, { recursive: true });
				console.log(`正在复制预览图: ${oldPath} -> ${targetPreviewPath}`);
				fs.copyFileSync(oldPath, targetPreviewPath);
			}

			// 2. 使用 sharp 生成缩略图 (如果不存在)
			if (!fs.existsSync(targetThumbPath)) {
				if (!fs.existsSync(thumbDir))
					fs.mkdirSync(thumbDir, { recursive: true });
				console.log(
					`正在生成缩略图: ${targetPreviewPath} -> ${targetThumbPath}`,
				);
				await sharp(targetPreviewPath)
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
