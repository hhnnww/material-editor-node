import fs from "node:fs";
import path from "node:path";
import { setting } from "#/setting";

export function FUN_判断源文件是否有素材图(props: { materialFile: string }) {
	const { materialFile } = props;
	const dir = path.dirname(materialFile);
	const stem = path
		.basename(materialFile, path.extname(materialFile))
		.toLowerCase();

	const files = fs.readdirSync(dir);
	const imageSuffixes = setting.imageSuffixList.map((s) => s.toLowerCase());

	return files.some((file) => {
		const ext = path.extname(file).toLowerCase();
		if (!imageSuffixes.includes(ext)) return false;
		const fileStem = path.basename(file, ext).toLowerCase();
		return fileStem.includes(stem);
	});
}
