import sharp from "sharp";
import { makeTextImage } from "#/material-edit/fun-图片功能/fun-制作文字图片2";
import { FUN_获取LOGO图片 } from "#/material-edit/fun-图片功能/fun-获取logo图片";

export const ST_制作圆圈 = async (props: {
	shopName: string;
	materialID: string;
}) => {
	/**
	 * 画一个圆圈，直径740px 颜色 #ffC655
	 */
	const size = 740;
	const spacing = 30;
	const circleSvg = `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#000000" /></svg>`;
	const logoBuffer = await FUN_获取LOGO图片();
	const currentColor = "#FFC655";
	const coloredLogo = await sharp(logoBuffer)
		.resize(120)
		.linear([0, 0, 0, 1], [255, 198, 85, 0]) // 将 logo 颜色填充为 #ffc655 (RGB: 255, 198, 85)
		.png()
		.toBuffer();
	const logoMeta = await sharp(coloredLogo).metadata();
	const shopNameBuffer = await makeTextImage({
		fillColor: currentColor,
		text: props.shopName,
		fontWeight: "Bold",
		height: 40,
	});
	const shopMeta = await sharp(shopNameBuffer).metadata();

	const top =
		((size - 300) / 2 - logoMeta.height - shopMeta.height - spacing) / 2;

	const adBuffer = await makeTextImage({
		text: `${props.shopName} 只卖精品`,
		fontWeight: "SemiBold",
		fillColor: currentColor,
		height: 40,
	});
	const adMeta = await sharp(adBuffer).metadata();

	const idBuffer = await makeTextImage({
		text: `ID:${props.materialID}`,
		fontWeight: "SemiBold",
		fillColor: currentColor,
		height: 30,
	});
	const idMeta = await sharp(idBuffer).metadata();

	const colSize = (size - 300) / 2;
	const buttomTop =
		colSize + 300 + (colSize - adMeta.height - idMeta.height - spacing) / 2;
	return await sharp(Buffer.from(circleSvg))
		.composite([
			{
				input: coloredLogo,
				top: top,
				left: Math.round((size - logoMeta.width) / 2),
			},
			{
				input: shopNameBuffer,
				top: top + logoMeta.height + spacing,
				left: Math.round((size - shopMeta.width) / 2),
			},
			{
				input: adBuffer,
				top: buttomTop,
				left: Math.round((size - adMeta.width) / 2),
			},
			{
				input: idBuffer,
				top: buttomTop + adMeta.height + spacing,
				left: Math.round((size - idMeta.width) / 2),
			},
		])
		.png()
		.toBuffer();
};
