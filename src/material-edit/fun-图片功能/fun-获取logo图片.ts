import path from "node:path";
import sharp from "sharp";

export async function FUN_获取LOGO图片() {
	const logoPath = path.resolve(process.cwd(), "public/小鱼.png");
	return await sharp(logoPath).png().toBuffer();
}
