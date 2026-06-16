import fs from "node:fs";
import path from "node:path";

/**
 * 递归遍历文件夹，获取所有符合后缀条件的文件路径
 * @param folder 目标文件夹路径
 * @param suffixs 可选的文件后缀过滤数组 (例如: ['.jpg', '.png'])
 * @returns 文件绝对路径数组
 */
export function FUN_递归遍历文件夹(folder: string, suffixs?: string[]) {
	const files: string[] = [];

	function traverse(currentPath: string) {
		const items = fs.readdirSync(currentPath);

		for (const item of items) {
			const fullPath = path.join(currentPath, item);
			const stat = fs.statSync(fullPath);

			if (stat.isDirectory()) {
				traverse(fullPath);
			} else if (stat.isFile()) {
				if (
					!suffixs ||
					suffixs.some((suffix) =>
						item.toLowerCase().endsWith(suffix.toLowerCase()),
					)
				) {
					files.push(fullPath);
				}
			}
		}
	}

	traverse(folder);
	return files;
}
