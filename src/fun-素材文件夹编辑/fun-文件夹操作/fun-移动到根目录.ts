import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export function FUN_移动到根目录(materialPath: string) {
	const fileList = FUN_递归遍历文件夹(materialPath);

	for (const filePath of fileList) {
		const parentDir = path.dirname(filePath);

		// 如果文件不在 materialPath 根目录下，则需要移动
		if (path.normalize(parentDir) !== path.normalize(materialPath)) {
			const fileName = path.basename(filePath);
			const ext = path.extname(fileName);
			const nameWithoutExt = path.basename(fileName, ext);

			let targetPath = path.join(materialPath, fileName);
			let counter = 1;

			// 保证不重名，添加 _1, _2 等数字
			while (fs.existsSync(targetPath)) {
				targetPath = path.join(
					materialPath,
					`${nameWithoutExt}_${counter}${ext}`,
				);
				counter++;
			}

			console.log(`正在移动文件: ${filePath} -> ${targetPath}`);
			fs.renameSync(filePath, targetPath);
		}
	}

	// 文件全部移动到根目录后，删除目录下的所有文件夹
	const items = fs.readdirSync(materialPath);
	for (const item of items) {
		const fullPath = path.join(materialPath, item);
		const stats = fs.statSync(fullPath);

		if (stats.isDirectory()) {
			try {
				console.log(`正在删除文件夹: ${fullPath}`);
				execSync(`rd /s /q "${fullPath}"`);
			} catch (error) {
				console.error(`无法删除文件夹: ${fullPath}`, error);
			}
		}
	}
}
