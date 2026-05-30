import sharp from "sharp";
import { FUN_制作文字图片 } from "#/material-edit/fun-图片功能/fun-制作文字图片";
import { setting } from "#/setting";

export async function ST_黑鲸标题(params: { title: string }) {
	/**
	 * 根据width height创建一个圆角矩形
	 * 左上角和右上角的圆角度是borderradius
	 * 左下和右下是直角
	 * 把文字粘贴到这个矩形，垂直居中
	 * 靠左120px
	 */
	const width = setting.stWidth;
	const height = setting.stHeijingHeight;
	const borderRadius = 133;
	const fontSize = 133;
	const fontImage = await FUN_制作文字图片({
		text: params.title,
		fontSize: fontSize,
		fontWidth: "Medium",
		fillColor: "#FFFFFF",
	});

	const svgRect = Buffer.from(
		`<svg width="${width}" height="${height}">
			<rect x="0" y="0" width="${width}" height="${height + borderRadius}" rx="${borderRadius}" ry="${borderRadius}" fill="#000" />
		</svg>`,
	);
	const bgImage = sharp(svgRect);

	return await bgImage
		.composite([
			{
				input: fontImage,
				left: 110,
				top: Math.round((height - fontSize) / 2) - 2,
			},
		])
		.trim()
		.png()
		.toBuffer();
}
