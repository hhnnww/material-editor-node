import { exec } from "node:child_process";
import os from "node:os";
import path from "node:path";

export function FUN_打开桌面上传文件夹() {
	// 使用explorer打开桌面上的upload文件夹
	const desktopPath = path.join(os.homedir(), "Desktop");
	const uploadPath = path.join(desktopPath, "upload");

	const command = "explorer";
	exec(`${command} "${uploadPath}"`);
}
