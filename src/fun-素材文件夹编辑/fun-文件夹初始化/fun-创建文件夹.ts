import fs from "node:fs";
import path from "node:path";

export function FUN_创建文件夹(rootPath: string): {
	materialPath: string;
	previewPath: string;
	thumbPath: string;
	designPath: string;
	effectPath: string;
} {
	/**
	 * 1,创建素材文件夹 rootPath / rootPath的stem
	 * 2，创建预览图文件夹 rootPath / 预览图
	 * 3，创建缩略图文件夹 rootPath / 缩略图
	 * 4，创建设计图文件夹 rootPath / 设计图
	 * 5，创建效果图文件夹  rootPath / 效果图
	 */
	const stem = path.basename(rootPath);

	const paths = {
		materialPath: path.join(rootPath, stem),
		previewPath: path.join(rootPath, "预览图"),
		thumbPath: path.join(rootPath, "缩略图"),
		designPath: path.join(rootPath, "设计图"),
		effectPath: path.join(rootPath, "效果图"),
	};

	console.log("准备创建的路径:", paths);

	// 确保根目录存在
	if (!fs.existsSync(rootPath)) {
		fs.mkdirSync(rootPath, { recursive: true });
	}

	// 循环创建子文件夹
	for (const dirPath of Object.values(paths)) {
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
			console.log(`已创建目录: ${dirPath}`);
		}
	}

	/**
	 * 遍历rootpath文件夹下的文件和文件夹
	 * 如果文件是文件，直接移动到素材文件夹
	 * 如果是文件夹，并且不是以上的文件夹
	 * 则移动到素材文件夹
	 */
	const items = fs.readdirSync(rootPath);
	console.log(`在根目录发现项目: ${items.join(", ")}`);
	const protectedPaths = Object.values(paths).map((p) => path.basename(p));

	for (const item of items) {
		const fullPath = path.join(rootPath, item);
		const targetPath = path.join(paths.materialPath, item);

		// 如果是受保护的文件夹（即刚刚创建的那几个），跳过
		if (protectedPaths.includes(item)) {
			continue;
		}

		// 移动文件或文件夹到素材文件夹
		if (fs.existsSync(fullPath)) {
			console.log(`正在移动 ${item} 到 ${paths.materialPath}`);
			fs.renameSync(fullPath, targetPath);
		}
	}

	return paths;
}
