import sharp from "sharp";
import { FUN_制作文字图片 } from "#/fun-图片功能/fun-制作文字图片";

export async function ST_黑鲸格式(format: string) {
	/**
	 * 创建一个圆形，根据format选择背景和边框颜色
	 * 边框在外面
	 * 再把文字垂直和水平居中站贴到圆形的正中间
	 */

	const colorMap: Record<
		string,
		{ backgroundColor: string; textColor: string; borderColor: string }
	> = {
		ps: {
			backgroundColor: "#001E36",
			textColor: "#31A8FF",
			borderColor: "#31A8FF",
		},
		psd: {
			backgroundColor: "#001E36",
			textColor: "#31A8FF",
			borderColor: "#31A8FF",
		},
		ppt: {
			backgroundColor: "#C14024",
			textColor: "#FFFFFF",
			borderColor: "#FE9472",
		},
		ai: {
			backgroundColor: "#330000",
			textColor: "#FF9A00",
			borderColor: "#FF9A00",
		},
		normal: {
			backgroundColor: "#000000",
			textColor: "#fff",
			borderColor: "#fff",
		},
	};
	const width = 250;
	const height = width;
	const config = colorMap[format.toLowerCase()] || colorMap.normal;
	const fontSize = format.length <= 2 ? 105 : 80;
	const borderWidth = 13;

	const formatTextImg = await FUN_制作文字图片({
		text: format.toUpperCase(),
		fontSize: fontSize,
		fontWidth: "Bold",
		fillColor: config.textColor,
	});

	const r = width / 2 - borderWidth;
	const svgCircle = Buffer.from(
		`<svg width="${width}" height="${height}">
			<circle cx="${width / 2}" cy="${height / 2}" r="${r}" fill="${config.backgroundColor}" stroke="${config.borderColor}" stroke-width="${borderWidth}" />
		</svg>`,
	);

	const textMeta = await sharp(formatTextImg).metadata();

	return await sharp(svgCircle)
		.composite([
			{
				input: formatTextImg,
				left: Math.round((width + borderWidth - (textMeta.width || 0)) / 2) - 5,
				top:
					Math.round((height + borderWidth - (textMeta.height || 0)) / 2) - 5,
			},
		])
		.png()
		.toBuffer();
}
