import { exec } from "node:child_process";
import path from "node:path";

export function FUN_打开素材大目录(shopName: string) {
	const maFolder = path.join("f:/", shopName);
	const command = "explorer";
	exec(`${command} ${maFolder}`);
}
