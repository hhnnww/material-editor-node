import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";

export function FUN_子目录重命名(materialPath: string, shopName: string) {
	/**
	 * 遍历materiapath下的直接子目录
	 * 给这些子目录重命名 重命名格式 nid(1) nid(2) 这样的自增
	 * 然后重命名为 shopName(001) shopName(002) 这样的自增，要有3位数
	 */
	const items = fs.readdirSync(materialPath);
	const subDirs = items
		.map((item) => path.join(materialPath, item))
		.filter((fullPath) => fs.statSync(fullPath).isDirectory());

	if (subDirs.length === 0) return;

	const nid = nanoid(8);

	// 第一次重命名：使用 nanoid 防止目录名冲突
	const tempPaths: string[] = [];
	for (let i = 0; i < subDirs.length; i++) {
		const oldPath = subDirs[i];
		const newName = `${nid}(${i + 1})`;
		const newPath = path.join(materialPath, newName);

		try {
			fs.renameSync(oldPath, newPath);
			tempPaths.push(newPath);
		} catch (error) {
			console.error(`子目录临时重命名失败: ${oldPath}`, error);
		}
	}

	// 第二次重命名：使用 shopName(001) 格式
	for (let i = 0; i < tempPaths.length; i++) {
		const oldPath = tempPaths[i];
		const indexStr = (i + 1).toString().padStart(3, "0");
		const newName = `${shopName}(${indexStr})`;
		const newPath = path.join(materialPath, newName);

		try {
			fs.renameSync(oldPath, newPath);
		} catch (error) {
			console.error(`子目录最终重命名失败: ${oldPath}`, error);
		}
	}
}
