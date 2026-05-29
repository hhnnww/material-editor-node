import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export async function FUN_清空上传文件夹() {
	const upPath = path.join(os.homedir(), "Desktop", "UPLOAD");

	if (fs.existsSync(upPath)) {
		const files = fs.readdirSync(upPath);
		for (const file of files) {
			if (file.toLowerCase().endsWith(".jpg") && file.includes("xq_")) {
				fs.unlinkSync(path.join(upPath, file));
			}
		}
	}
}
