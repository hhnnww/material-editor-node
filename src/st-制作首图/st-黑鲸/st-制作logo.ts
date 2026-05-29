import sharp from "sharp";
import { FUN_制作文字图片 } from "#/fun-图片功能/fun-制作文字图片";
import { FUN_获取LOGO图片 } from "#/fun-图片功能/fun-获取logo图片";

export async function ST_制作黑鲸LOGO(shopName: string) {
	const borderRadius = 60;
	const spacing = 25;
	const width = 230;
	const height = 220;
	const logoSize = Math.ceil(width * 0.63);
	const fontSize = 38;

	// 1. 获取原始 LOGO 并调整为固定的宽高度
	// 这里直接在第一步 resize 掉，免得后面 metadata 拿到的尺寸不准
	const logoBuff = await sharp(await FUN_获取LOGO图片())
		.resize({ width: logoSize })
		.linear([0, 0, 0], [255, 255, 255])
		.toBuffer();

	// 2. 生成文字图片
	const shopBuff = await FUN_制作文字图片({
		fontWidth: "Bold",
		fontSize: fontSize,
		text: shopName,
		fillColor: "#FFFFFF",
	});

	// 3. 获取各组件准确的渲染尺寸
	const logoMeta = await sharp(logoBuff).metadata();
	const shopMeta = await sharp(shopBuff).metadata();

	const logoW = logoMeta.width || logoSize;
	const logoH = logoMeta.height || logoSize;
	const shopW = shopMeta.width || 0;
	const shopH = shopMeta.height || 0;

	// 🎯 计算内容真实总高度
	const totalContentHeight = logoH + spacing + shopH;

	// 4. 生成黑色下圆角矩形的遮罩背景
	const svgRect = Buffer.from(
		`<svg width="${width}" height="${height}">
            <path d="M 0 0 H ${width} V ${height - borderRadius} Q ${width} ${height} ${width - borderRadius} ${height} H ${borderRadius} Q 0 ${height} 0 ${height - borderRadius} Z" fill="#000000" />
        </svg>`,
	);

	// 计算整体垂直居中的起始 Y 坐标
	const startY = (height - totalContentHeight) / 2;

	// 🎯 核心修正：
	// 创建一个纯透明的像素画布，然后将【黑色下圆角背景】、【LOGO】、【文字】依次叠上去
	const resultBuffer = await sharp({
		create: {
			width: width,
			height: height,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 0 }, // 初始透明底
		},
	})
		.composite([
			{
				input: svgRect,
				left: 0,
				top: 0,
				blend: "over", // 叠上黑色背景
			},
			{
				input: logoBuff,
				left: Math.round((width - logoW) / 2),
				top: Math.round(startY),
				blend: "over", // 叠上 LOGO
			},
			{
				input: shopBuff,
				left: Math.round((width - shopW) / 2),
				top: Math.round(startY + logoH + spacing),
				blend: "over", // 叠上文字
			},
		])
		.png()
		.toBuffer();

	return resultBuffer;
}
