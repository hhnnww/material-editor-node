import sharp from "sharp";
import type { fontWeight } from "#/setting";
import { IMAGE_制作圆角矩形 } from "./fun-制作圆角矩形";
import { makeTextImage } from "./fun-制作文字图片2";

export const IMAGE_制作圆角文字 = async (props: {
	text: string;
	bgColor: string;
	textColor: string;
	borderRadius: number;
	fontWeight: fontWeight;
	height: number;
	spacingX: number;
	spacingY: number;
}) => {
	const textImage = await makeTextImage({
		fillColor: props.textColor,
		fontWeight: props.fontWeight,
		text: props.text,
		height: props.height,
	});
	const textMeta = await sharp(textImage).metadata();
	const textWidth = textMeta.width || 0;
	const textHeight = textMeta.height || 0;

	const bgWidth = textWidth + props.spacingX * 2;
	const bgHeight = textHeight + props.spacingY * 2;

	const reactSvg = await IMAGE_制作圆角矩形({
		borderRadius: props.borderRadius,
		fillColor: props.bgColor,
		height: bgHeight,
		width: bgWidth,
	});

	return await sharp(reactSvg)
		.composite([
			{
				input: textImage,
				left: props.spacingX,
				top: props.spacingY,
			},
		])
		.png()
		.toBuffer();
};
