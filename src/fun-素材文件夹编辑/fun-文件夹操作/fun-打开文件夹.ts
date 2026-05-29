import { exec } from "node:child_process";

export function FUN_打开文件夹(folder: string) {
	/**
	 * 使用explorer打开指定文件夹
	 */
	const command = "explorer";
	exec(`${command} "${folder}"`, (error) => {
		if (error) {
			console.error(`无法打开文件夹: ${folder}`, error);
		}
	});
}
