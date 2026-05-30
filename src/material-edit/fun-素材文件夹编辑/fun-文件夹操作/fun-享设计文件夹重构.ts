import fs from "node:fs";
import path from "node:path";

export function FUN_享设计文件夹重构(materialPath: string) {
	/**
	 * 遍历materiapath下的直接子文件夹
	 * 把子文件夹内，只要不是.ai和.eps后缀的内容
	 * 全部移动到子文件夹/Links目录内
	 */
	const items = fs.readdirSync(materialPath);

	for (const item of items) {
		const subDirPath = path.join(materialPath, item);
		const stats = fs.statSync(subDirPath);

		if (stats.isDirectory()) {
			const linksPath = path.join(subDirPath, "Links");
			const subDirItems = fs.readdirSync(subDirPath);

			for (const subItem of subDirItems) {
				const subItemPath = path.join(subDirPath, subItem);
				const ext = path.extname(subItem).toLowerCase();

				// 排除 .ai, .eps 和 Links 文件夹本身
				if (ext !== ".ai" && ext !== ".eps" && subItem !== "Links") {
					// 确保 Links 目录存在
					if (!fs.existsSync(linksPath)) {
						fs.mkdirSync(linksPath, { recursive: true });
					}

					const targetPath = path.join(linksPath, subItem);
					try {
						console.log(`正在重构: ${subItemPath} -> ${targetPath}`);
						fs.renameSync(subItemPath, targetPath);
					} catch (error) {
						console.error(`重构移动文件失败: ${subItemPath}`, error);
					}
				}
			}
		}
	}
}
