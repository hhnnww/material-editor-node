import fs from "node:fs";
import path from "node:path";
import { setting } from "#/setting";

export function FUN_子目录图片重命名(materialPath: string) {
	/**
	 * 遍历 materialPath 下的直接子目录
	 * 遍历子目录内的图片文件
	 * 将图片重命名为子目录的 stem，多个图片则添加 _1, _2...
	 */
	const items = fs.readdirSync(materialPath);

	for (const item of items) {
		const subDirPath = path.join(materialPath, item);
		const stats = fs.statSync(subDirPath);

		if (stats.isDirectory()) {
			const subDirStem = item;
			const subDirItems = fs.readdirSync(subDirPath);

			// 过滤出图片文件
			const imageFiles = subDirItems.filter((file) => {
				const ext = path.extname(file).toLowerCase();
				return setting.imageSuffixList.includes(ext);
			});

			imageFiles.forEach((fileName, index) => {
				const oldPath = path.join(subDirPath, fileName);
				const ext = path.extname(fileName);

				// 第一个用子文件夹名，后续加 _index
				const newStem = index === 0 ? subDirStem : `${subDirStem}_${index}`;
				const newPath = path.join(subDirPath, `${newStem}${ext}`);

				if (oldPath !== newPath && !fs.existsSync(newPath)) {
					fs.renameSync(oldPath, newPath);
				}
			});
		}
	}
}
