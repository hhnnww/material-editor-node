import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { setting } from "#/setting";
import { FUN_制作横向水印 } from "./fun-制作横向水印";

export async function FUN_保存图片(
	im: Buffer<ArrayBufferLike>,
	stem: string,
	warter: boolean,
) {
	const desktopPath = path.join(os.homedir(), "Desktop");
	const uploadDir = path.join(desktopPath, "UPLOAD");

	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}
	const outputPath = path.join(uploadDir, `${stem}.jpg`);

	if (!warter) {
		await sharp(im).jpeg().toFile(outputPath);
		return;
	}

	const waterLogo = await FUN_制作横向水印();
	const waterMeta = await sharp(waterLogo).metadata();

	console.log(`正在保存图片到: ${outputPath}`);

	const baseImage = sharp(im);
	const { width, height } = await baseImage.metadata();

	if (!width || !height) {
		throw new Error("无法读取输入图片的尺寸");
	}

	// 居中裁剪水印：如果底图宽度小于水印宽度(4000)，则从水印中心截取
	const watermarkWidth = waterMeta.width;
	const processedWatermark = await sharp(waterLogo)
		.extract({
			left: Math.floor((watermarkWidth - width) / 2),
			top: 0,
			width: width,
			height: setting.logoSize, // 100是fun-制作横向水印中定义的高度
		})
		.toBuffer();

	await baseImage
		.composite([
			{
				input: processedWatermark,
				left: Math.max(0),
				top: Math.floor((height - setting.logoSize) / 2),
			},
		])
		.jpeg({ quality: 80 })
		.toFile(outputPath);

	return outputPath;
}
