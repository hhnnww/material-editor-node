import { execSync } from "node:child_process";
import fs from "node:fs";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export function FUN_解压ZIP(materialPath: string) {
	/**
	 * bandzip 解压命令
	 * Bandizip.exe bx -o:materialPath -target:name a.zip b.zip c.zip
	 * 根据这个命令解压所有压缩包文件
	 * 解压完成之后删除所有zip压缩包
	 */
	const zipFileList = FUN_递归遍历文件夹(materialPath, setting.zipSuffixList);
	console.log(`找到压缩文件列表:`, zipFileList);

	if (zipFileList.length === 0) return;

	try {
		// 构建一次性解压所有文件的命令
		const filesArgs = zipFileList.map((zip) => `"${zip}"`).join(" ");
		const command = `Bandizip.exe bx -target:name -o:"${materialPath}" ${filesArgs}`;
		console.log(`正在执行批量解压命令: ${command}`);
		execSync(command);

		// 解压成功后删除所有压缩包
		for (const zipPath of zipFileList) {
			console.log(`正在删除压缩包: ${zipPath}`);
			fs.unlinkSync(zipPath);
		}
	} catch (error) {
		console.error(`批量解压失败`, error);
	}
}
