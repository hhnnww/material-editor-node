import { exec } from "node:child_process";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

export async function FUN_TEXT_IMAGE(im: Buffer<ArrayBufferLike>) {
	const tempPath = path.join(os.tmpdir(), "tid.png");

	// 把im利用sharp保存到这个图片
	await sharp(im).toFile(tempPath);

	// 然后使用windows命令打开这个图片
	exec(`start "" "${tempPath}"`);
}
