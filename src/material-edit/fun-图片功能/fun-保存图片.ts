import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createServerOnlyFn } from "@tanstack/react-start";
import sharp from "sharp";
import { setting } from "#/setting";
import { FUN_制作横向水印 } from "./fun-制作横向水印";

let cachedWatermarkLogo: Buffer | null = null;
let cachedWatermarkWidth: number | null = null;
const processedWatermarkCache = new Map<string, Buffer>();

async function getWatermarkData(): Promise<{ logo: Buffer; width: number }> {
	const logo = cachedWatermarkLogo;
	const width = cachedWatermarkWidth;
	if (logo && width !== null) {
		return { logo, width };
	}
	const newLogo = await FUN_制作横向水印();
	const meta = await sharp(newLogo).metadata();
	const newWidth = meta.width || 3000;
	cachedWatermarkLogo = newLogo;
	cachedWatermarkWidth = newWidth;
	return { logo: newLogo, width: newWidth };
}

export async function FUN_保存图片_Core(baseImage: sharp.Sharp, width: number, height: number, outputPath: string, warter: boolean) {
	if (!warter) {
		await baseImage.jpeg().toFile(outputPath);
		return;
	}

	const { logo: waterLogo, width: watermarkWidth } = await getWatermarkData();
	const watermarkHeight = Math.min(setting.logoSize, height);
	const cacheKey = `${width}_${watermarkHeight}`;

	let processedWatermark = processedWatermarkCache.get(cacheKey);
	if (!processedWatermark) {
		processedWatermark = await sharp(waterLogo)
			.extract({
				left: Math.floor((watermarkWidth - width) / 2),
				top: 0,
				width: width,
				height: watermarkHeight,
			})
			.toBuffer();
		processedWatermarkCache.set(cacheKey, processedWatermark);
	}

	await baseImage
		.composite([
			{
				input: processedWatermark,
				left: 0,
				top: Math.floor((height - watermarkHeight) / 2),
			},
		])
		.jpeg({ quality: 80 })
		.toFile(outputPath);
}

export const FUN_保存图片 = createServerOnlyFn(async (im: Buffer<ArrayBufferLike>, stem: string, warter: boolean) => {
	const desktopPath = path.join(os.homedir(), "Desktop");
	const uploadDir = path.join(desktopPath, "UPLOAD");

	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}
	const outputPath = path.join(uploadDir, `${stem}.jpg`);

	const baseImage = sharp(im);
	const { width, height } = await baseImage.metadata();

	if (!width || !height) {
		throw new Error("无法读取输入图片的尺寸");
	}

	await FUN_保存图片_Core(baseImage, width, height, outputPath, warter);

	return outputPath;
});
