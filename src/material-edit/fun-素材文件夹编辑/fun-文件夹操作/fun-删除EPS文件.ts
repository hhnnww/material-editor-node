import fs from "node:fs";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export function FUN_删除EPS文件(materialPath: string) {
	const epsFileList = FUN_递归遍历文件夹(materialPath, [".eps"]);

	for (const filePath of epsFileList) {
		try {
			fs.unlinkSync(filePath);
		} catch (error) {
			console.error(`删除 EPS 文件失败: ${filePath}`, error);
		}
	}
}
