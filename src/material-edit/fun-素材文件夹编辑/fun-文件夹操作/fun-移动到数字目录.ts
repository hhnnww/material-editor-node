import fs from "node:fs";
import path from "node:path";

export function FUN_移动到数字目录(props: { folderList: string[] }) {
	for (const materialPath of props.folderList) {
		if (!fs.existsSync(materialPath)) continue;
		const items = fs.readdirSync(materialPath);

		for (const item of items) {
			const fullPath = path.join(materialPath, item);
			const stats = fs.statSync(fullPath);

			// 只处理文件
			if (stats.isFile()) {
				const stem = path.basename(item, path.extname(item));
				// 提取文件名中的数字
				const match = stem.match(/\d+/);
				if (match) {
					const num = parseInt(match[0], 10);
					const start = Math.floor(num / 100) * 100;
					const end = start + 99;
					const folderName = `${start}-${end}`;
					const targetDir = path.join(materialPath, folderName);

					if (!fs.existsSync(targetDir)) {
						fs.mkdirSync(targetDir, { recursive: true });
					}

					const targetPath = path.join(targetDir, item);
					console.log(`正在移动文件到数字目录: ${item} -> ${folderName}`);
					fs.renameSync(fullPath, targetPath);
				}
			}
		}
	}
}
