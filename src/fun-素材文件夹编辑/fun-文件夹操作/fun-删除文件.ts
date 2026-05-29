import fs from "node:fs";

export function FUN_删除文件(fileList: string[]) {
	/**
	 * 遍历并删除文件
	 */
	for (const filePath of fileList) {
		try {
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		} catch (error) {
			console.error(`删除文件失败: ${filePath}`, error);
		}
	}
}
