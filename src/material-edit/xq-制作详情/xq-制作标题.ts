import sharp from "sharp";
import { FUN_制作文字图片 } from "#/material-edit/fun-图片功能/fun-制作文字图片";
import { setting } from "#/setting";

export async function XQ_制作标题(props: { title: string; desc: string }) {
	const titleImg = await FUN_制作文字图片({
		text: props.title,
		fontSize: 69,
		fontWidth: "SemiBold",
		fillColor: "#333",
	});

	const descImg = await FUN_制作文字图片({
		text: props.desc,
		fontSize: 39,
		fontWidth: "Regular",
		fillColor: "#999",
	});

	const titleMeta = await sharp(titleImg).metadata();
	const descMeta = await sharp(descImg).metadata();

	const rectWidth = (titleMeta.width || 0) + 30;
	const rectHeight = 20;
	const rectSvg = Buffer.from(`
		<svg width="${rectWidth}" height="${rectHeight}">
			<rect x="0" y="0" width="${rectWidth}" height="${rectHeight}" rx="10" ry="10" fill="#f9e3c6" />
		</svg>
	`);

	const outerPaddingTop = 400;
	const outerPaddingBottom = 250;
	const spacing = 35;
	const width = setting.xqWidth;
	const height =
		outerPaddingTop +
		outerPaddingBottom +
		(titleMeta.height || 0) +
		(descMeta.height || 0) +
		spacing;

	return await sharp({
		create: {
			width: width,
			height: height,
			channels: 4,
			background: { r: 255, g: 255, b: 255, alpha: 1 },
		},
	})
		.composite([
			{
				input: rectSvg,
				top: outerPaddingTop + (titleMeta.height || 0) - 10, // 与标题重合
				left: Math.floor((width - rectWidth) / 2),
			},
			{
				input: titleImg,
				top: outerPaddingTop,
				left: Math.floor((width - (titleMeta.width || 0)) / 2),
			},
			{
				input: descImg,
				top: outerPaddingTop + (titleMeta.height || 0) + spacing,
				left: Math.floor((width - (descMeta.width || 0)) / 2),
			},
		])
		.png()
		.toBuffer();
}
