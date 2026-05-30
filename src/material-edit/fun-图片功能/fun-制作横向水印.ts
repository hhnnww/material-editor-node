import sharp, { type OverlayOptions } from "sharp";
import { setting } from "#/setting";
import { FUN_获取LOGO图片 } from "./fun-获取logo图片";

export async function FUN_制作横向水印() {
	const logoBuffer = await FUN_获取LOGO图片();
	const spacing = 120;
	const logoSize = setting.logoSize;
	const width = 3000;
	const height = logoSize;

	// 🎯 核心控制点：你想要的不透明度（0.2 代表 20% 不透明，0.0 为全透明）
	const opacity = 0.45;

	// 1. 调整 logo 大小，同时将其覆盖为纯白色，并动态计算半透明度
	const resizedLogo = await sharp(logoBuffer)
		.resize(logoSize, logoSize, {
			fit: "contain",
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		})
		// 💡 核心修正：linear 的第一个数组参数作用于原图通道 [R, G, B, A]
		// 乘以 0 抹去原色，Alpha 乘以 opacity 限制最高透明度。第二个数组参数加 255 变成纯白
		.linear([0, 0, 0, opacity], [155, 155, 155, 0])
		.png() // 确保输出带透明通道的 png 缓存
		.toBuffer();

	// 2. 计算平铺位置
	const composites: OverlayOptions[] = [];
	const step = logoSize + spacing;

	for (let x = 0; x < width; x += step) {
		composites.push({
			input: resizedLogo,
			left: x,
			top: 0,
			blend: "over", // 🎯 修正：使用 over 正常叠加到透明底板上
		});
	}

	// 3. 创建空白画板并合成
	return await sharp({
		create: {
			width: width,
			height: height,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 0 }, // 纯透明长条底板
		},
	})
		.composite(composites) // 🎯 修正：直接把带 blend: "over" 的数组传进去
		.png()
		.toBuffer();
}
