import sharp from "sharp";
import { IMAGE_制作圆角文字 } from "#/material-edit/fun-图片功能/fun-制作圆角文字图片";
import { IMAGE_制作圆角矩形 } from "#/material-edit/fun-图片功能/fun-制作圆角矩形";
import { makeTextImage } from "#/material-edit/fun-图片功能/fun-制作文字图片2";

export const ST_制作标题栏 = async (props: {
	title: string;
	formatTitle: string;
	adText: string;
}) => {
	const titleImage = await makeTextImage({
		text: props.title,
		fillColor: "#000000",
		fontWeight: "Bold",
		height: 120,
	});
	const titleImageMeta = await sharp(titleImage).metadata();
	const currentColor = "#ffC655";
	const bgWidth = 1300;
	const bgHeight = 300;
	const svgReact = await IMAGE_制作圆角矩形({
		borderRadius: 160,
		fillColor: currentColor,
		height: bgHeight,
		width: bgWidth,
	});

	const topSpacing = 200;
	const left = Math.round((bgWidth - (titleImageMeta.width || 0)) / 2);
	const top = Math.round((topSpacing - (titleImageMeta.height || 0)) / 2);

	const formatImage = await IMAGE_制作圆角文字({
		bgColor: "#000000",
		text: props.formatTitle,
		textColor: currentColor,
		borderRadius: 30,
		fontWeight: "Bold",
		height: 30,
		spacingX: 60,
		spacingY: 16,
	});
	const formatMeta = await sharp(formatImage).metadata();
	const leftSpacing = 160;
	const adImage = await makeTextImage({
		text: props.adText,
		fontWeight: "Medium",
		fillColor: "#000000",
		height: 40,
	});
	const adMeta = await sharp(adImage).metadata();
	return await sharp(svgReact)
		.composite([
			{
				input: titleImage,
				left: left,
				top: top + 15,
			},
			{
				input: formatImage,
				left: leftSpacing,
				top: (bgHeight - topSpacing - formatMeta.height) / 2 + topSpacing,
			},
			{
				input: adImage,
				left: leftSpacing + formatMeta.width + 50,
				top: (bgHeight - topSpacing - adMeta.height) / 2 + topSpacing - 5,
			},
		])
		.png()
		.toBuffer();
};
