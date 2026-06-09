import sharp from "sharp";
import { makeTextImage } from "#/material-edit/fun-图片功能/fun-制作文字图片2";

export async function ST_黑鲸商家编码(currentStem: string) {
	/**
	 * 使用svg制作一个圆角矩形
	 * 宽度是stemimage 的 width + 40
	 * 高度是stemimage height + 40
	 * 黑色背景
	 * 圆角是borderradius
	 * 转换成sharp
	 * 然后新建一个sharp 把圆角矩形粘贴进去 宽度和高度和圆角矩形的尺寸一致
	 * 把stemimage 水平和垂直居中粘贴进去
	 * 返回buff
	 */
	const borderRadius = 40;
	const paddingX = 60;
	const paddingY = 50;
	const stemImage = await makeTextImage({
		text: `ID:${currentStem}`,
		height: 35,
		fontWeight: "SemiBold",
		fillColor: "#FFFFFF",
	});

	const stemMeta = await sharp(stemImage).metadata();
	const stemW = stemMeta.width || 0;
	const stemH = stemMeta.height || 0;

	const width = stemW + paddingX;
	const height = stemH + paddingY;

	const svgRect = Buffer.from(
		`<svg width="${width}" height="${height}">
			<rect x="0" y="0" width="${width}" height="${height}" rx="${borderRadius}" ry="${borderRadius}" fill="#000000" />
		</svg>`,
	);

	return await sharp(svgRect)
		.composite([
			{
				input: stemImage,
				left: Math.round((width - stemW) / 2) + 2,
				top: Math.round((height - stemH) / 2) - 1,
			},
		])
		.png()
		.toBuffer();
}
