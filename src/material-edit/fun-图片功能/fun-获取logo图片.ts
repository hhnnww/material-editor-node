import path from "node:path";
import convert from "color-convert";
import sharp from "sharp";

export async function FUN_获取LOGO图片(props: { height?: number; fillColor?: string } = {}) {
	const { height = 800, fillColor = "#000000" } = props;
	const logoPath = path.resolve(process.cwd(), "public/小鱼.png");

	// 将 hex 颜色转换为 RGB 数值
	const rgbColor = convert.hex.rgb(fillColor);

	return await sharp(logoPath).resize({ height }).linear([0, 0, 0], rgbColor).png().toBuffer();
}
