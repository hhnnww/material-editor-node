import fs from "node:fs";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export function FUN_删除广告文件(materialPath: string) {
	/**
	 * 使用windows命令行
	 * 删除这些ad文件
	 */
	const adFileList = FUN_递归遍历文件夹(materialPath, setting.adSuffixList);

	for (const filePath of adFileList) {
		try {
			console.log(`正在删除广告文件: ${filePath}`);
			fs.unlinkSync(filePath);
		} catch (error) {
			console.error(`删除广告文件失败: ${filePath}`, error);
		}
	}
}
