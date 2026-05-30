import fs from "node:fs";
import path from "node:path";
import { setting } from "#/setting";

export function FUN_子文件夹源文件重命名(materialPath: string) {
	/**
	 * 遍历mateiralPath的直接子文件夹
	 * 在子文件夹内直接遍历源文件
	 * 把源文件stem重命名为子文件夹stem，如果有多个的话第一个是子文件夹的stem，第二个就是stem_1
	 */
	const items = fs.readdirSync(materialPath);

	for (const item of items) {
		const subDirPath = path.join(materialPath, item);
		const stats = fs.statSync(subDirPath);

		if (stats.isDirectory()) {
			const subDirStem = item;
			const subDirItems = fs.readdirSync(subDirPath);

			// 过滤出源文件
			const materialFiles = subDirItems.filter((file) => {
				const ext = path.extname(file).toLowerCase();
				return setting.materialSuffixList.includes(ext);
			});

			materialFiles.forEach((fileName, index) => {
				const oldPath = path.join(subDirPath, fileName);
				const ext = path.extname(fileName);

				// 第一个用子文件夹名，后续加 _index
				const newStem = index === 0 ? subDirStem : `${subDirStem}_${index}`;
				const newPath = path.join(subDirPath, `${newStem}${ext}`);

				try {
					if (oldPath !== newPath) {
						console.log(`正在重命名源文件: ${oldPath} -> ${newPath}`);
						fs.renameSync(oldPath, newPath);
					}
				} catch (error) {
					console.error(`重命名源文件失败: ${oldPath}`, error);
				}
			});
		}
	}
}
