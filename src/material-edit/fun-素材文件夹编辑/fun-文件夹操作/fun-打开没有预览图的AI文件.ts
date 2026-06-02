import { createRequire } from "node:module";
import path from "node:path";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

const require = createRequire(import.meta.url);
const winax = require("winax");

export function FUN_打开没有预览图的AI文件(materialPath: string) {
	/**
	 * 查找ai或者eps源文件是否有对应的素材图
	 * 如果没有的话使用winax打开这个源文件
	 * 一次只能打开10个
	 */
	const materialFileList = FUN_递归遍历文件夹(materialPath, [".ai", ".eps"]);
	const imageFileList = FUN_递归遍历文件夹(
		materialPath,
		setting.imageSuffixList,
	);

	const missingPreviewFiles: string[] = [];

	for (const mFile of materialFileList) {
		const mDir = path.dirname(mFile);
		const mStem = path.basename(mFile, path.extname(mFile));

		// 检查同目录下是否存在同名的图片文件

		const hasPreview = imageFileList.some((imgFile) => {
			const imgDir = path.dirname(imgFile);
			const imgStem = path.basename(imgFile, path.extname(imgFile));
			return imgDir === mDir && imgStem.includes(mStem);
		});

		if (!hasPreview) {
			missingPreviewFiles.push(mFile);
		}
	}

	if (missingPreviewFiles.length === 0) {
		console.log("所有 AI/EPS 文件均已有预览图");
		return;
	}

	// 一次最多打开10个
	const filesToOpen = missingPreviewFiles.slice(0, 10);

	try {
		const app = new winax.Object("Illustrator.Application");
		for (const filePath of filesToOpen) {
			console.log(`正在打开缺失预览图的源文件: ${filePath}`);
			app.Open(filePath);
		}
	} catch (error) {
		console.error("调用 Illustrator 失败，请确保已安装 Illustrator", error);
	}
}
