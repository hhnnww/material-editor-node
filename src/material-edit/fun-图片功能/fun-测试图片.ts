import { exec } from "node:child_process";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

export async function FUN_TEXT_IMAGE(im: Buffer<ArrayBufferLike>) {
	const tempPath = path.join(os.tmpdir(), "tid.png");
	await sharp(im).toFile(tempPath);
	exec(`start "" "${tempPath}"`);
}
