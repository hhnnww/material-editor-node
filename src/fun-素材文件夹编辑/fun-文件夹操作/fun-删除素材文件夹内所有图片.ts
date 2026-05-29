import fs from "node:fs";
import path from "node:path";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export async function FUN_删除文件夹内所有图片(folders: string[]) {
	/**
	 * 删除素材文件夹内的所有图片
	 * 如果图片的父文件夹stem 是 link 或者 links 则不删除
	 */
	for (const folder of folders) {
		const imageFileList = FUN_递归遍历文件夹(folder, setting.imageSuffixList);

		for (const filePath of imageFileList) {
			const parentDirName = path.basename(path.dirname(filePath)).toLowerCase();

			// 如果图片的父文件夹stem 是 link 或者 links 则不删除
			if (parentDirName === "link" || parentDirName === "links") {
				continue;
			}

			try {
				fs.unlinkSync(filePath);
			} catch (error) {
				console.error(`删除图片失败: ${filePath}`, error);
			}
		}
	}
}
