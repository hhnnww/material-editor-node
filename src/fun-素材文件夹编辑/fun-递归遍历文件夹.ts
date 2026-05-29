import fs from "node:fs";
import path from "node:path";
export function FUN_递归遍历文件夹(folder: string, suffixs?: string[]) {
	/**
	 * 递归编辑文件夹内所有文件
	 * 如果给出了suffixs
	 * 则遍历指定后缀的文件
	 * 否则遍历所有文件
	 */
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
