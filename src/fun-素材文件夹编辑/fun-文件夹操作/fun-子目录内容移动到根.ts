import fs from "node:fs";
import path from "node:path";
import { FUN_移动到根目录 } from "./fun-移动到根目录";

export function FUN_子目录移动到根目录(materialPath: string) {
	/**
	 * 1,先遍历所有materiapath的直接子文件夹
	 * 2，利用 FUN_移动到根目录 把所有子文件夹的内容移动到子文件夹的根
	 */
	const items = fs.readdirSync(materialPath);

	for (const item of items) {
		const fullPath = path.join(materialPath, item);
		const stats = fs.statSync(fullPath);

		if (stats.isDirectory()) {
			console.log(`正在处理子目录: ${fullPath}`);
			FUN_移动到根目录(fullPath);
		}
	}
}
