import { createRequire } from "node:module";
import path from "node:path";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

const require = createRequire(import.meta.url);
const winax = require("winax");

export function FUN_打开没有预览图的PSD文件(materialPath: string) {
	const psdFileList = FUN_递归遍历文件夹(materialPath, [".psd", ".psb"]);
	console.log(`找到 PSD/PSB 文件列表:`, psdFileList);
	const imageFileList = FUN_递归遍历文件夹(
		materialPath,
		setting.imageSuffixList,
	);

	const missingPreviewFiles: string[] = [];

	for (const psdFile of psdFileList) {
		const psdDir = path.dirname(psdFile);
		const psdStem = path.basename(psdFile, path.extname(psdFile));

		// 检查同目录下是否存在同名的图片文件
		const hasPreview = imageFileList.some((imgFile) => {
			const imgDir = path.dirname(imgFile);
			const imgStem = path.basename(imgFile, path.extname(imgFile));
			return imgDir === psdDir && imgStem === psdStem;
		});

		if (!hasPreview) {
			missingPreviewFiles.push(psdFile);
		}
	}

	if (missingPreviewFiles.length === 0) {
		console.log("所有 PSD/PSB 文件均已有预览图");
		return;
	}

	const filesToOpen = missingPreviewFiles.slice(0, 10);

	try {
		const app = new winax.Object("Photoshop.Application");
		for (const filePath of filesToOpen) {
			console.log(`正在打开缺失预览图的 PSD: ${filePath}`);
			app.Open(filePath);
		}
	} catch (error) {
		console.error("调用 Photoshop 失败，请确保已安装 Photoshop", error);
	}
}
