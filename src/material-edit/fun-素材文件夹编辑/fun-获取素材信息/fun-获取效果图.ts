import fs from "node:fs";
import path from "node:path";
import { imageSizeFromFile } from "image-size/fromFile";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

type output = {
	imagePath: string;
	thumbpath: string;
	imageRatio: number;
	width: number;
	height: number;
}[];

export async function FUN_获取效果图(effectPath: string, thumbPath: string) {
	/**
	 * 效果图文件夹查找所有图片
	 * 然后查找对应的缩略图
	 * 使用 image-size 库获取效果图的宽度高度和比例
	 * 返回 output
	 */
	const effectImageList = FUN_递归遍历文件夹(
		effectPath,
		setting.imageSuffixList,
	);
	const effectThumbPath = path.join(thumbPath, "效果图");

	const result: output = [];

	for (const imagePath of effectImageList) {
		const relativePath = path.relative(effectPath, imagePath);
		const targetThumbPath = path.join(effectThumbPath, relativePath);

		// 只有当缩略图存在时才处理
		if (fs.existsSync(targetThumbPath)) {
			try {
				// 这里需要用fs先读取图片把
				const dimensions = await imageSizeFromFile(imagePath);
				if (dimensions.width && dimensions.height) {
					result.push({
						imagePath: imagePath,
						thumbpath: targetThumbPath,
						width: dimensions.width,
						height: dimensions.height,
						imageRatio: dimensions.width / dimensions.height,
					});
				}
			} catch (error) {
				console.error(`获取图片尺寸失败: ${imagePath}`, error);
			}
		} else {
			console.warn(`未找到对应的缩略图: ${targetThumbPath}`);
		}
	}

	result.sort((a, b) => b.imageRatio - a.imageRatio);

	return result;
}
