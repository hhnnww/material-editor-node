import fs from "node:fs";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { setting } from "#/setting";

export async function FUN_享设计制作预览图(materialPath: string) {
	const innerSpacing = 20;
	const outerSpacing = 20;
	const itemWidth = 800;
	const backgroundColor = "#efefef";
	const maxHeightLimit = 30000;

	const items = fs.readdirSync(materialPath);
	const subDirs = items.map((item) => path.join(materialPath, item)).filter((fullPath) => fs.statSync(fullPath).isDirectory());

	for (const subDir of subDirs) {
		const subDirStem = path.basename(subDir);
		const imageFiles = fs
			.readdirSync(subDir)
			.filter((file) => {
				const ext = path.extname(file).toLowerCase();
				const stem = path.basename(file, ext);
				const isAd = stem === "小夕素材-淘宝店-9.9元加入会员全店免费";
				return setting.imageSuffixList.includes(ext) && !isAd;
			})
			.map((file) => path.join(subDir, file));

		if (imageFiles.length === 0) continue;

		const targetPath = path.join(materialPath, `${subDirStem}.jpg`);
		if (fs.existsSync(targetPath)) continue;

		const composites: OverlayOptions[] = [];

		const metas = await Promise.all(imageFiles.map((img) => sharp(img).metadata()));

		const singleImage = imageFiles.length === 1;
		const actualItemWidth = singleImage ? metas[0].width || itemWidth : itemWidth;

		let totalHeightAtFullWidth = 0;
		for (const m of metas) {
			const h = Math.round(((m.height || 1) * actualItemWidth) / (m.width || 1));
			totalHeightAtFullWidth += h;
		}

		const cols = singleImage ? 1 : Math.max(1, Math.round(Math.sqrt((3 * totalHeightAtFullWidth) / (4 * actualItemWidth))));

		const canvasWidth = outerSpacing * 2 + cols * actualItemWidth + (cols - 1) * innerSpacing;

		const colHeights = new Array(cols).fill(0);

		for (let i = 0; i < imageFiles.length; i++) {
			const shortestCol = colHeights.indexOf(Math.min(...colHeights));
			const resizedImage = singleImage ? sharp(imageFiles[i]) : sharp(imageFiles[i]).resize(actualItemWidth);
			const buffer = await resizedImage.toBuffer();
			const meta = await sharp(buffer).metadata();

			const x = outerSpacing + shortestCol * (actualItemWidth + innerSpacing);
			const y = outerSpacing + colHeights[shortestCol];

			composites.push({
				input: buffer,
				left: x,
				top: y,
			});

			colHeights[shortestCol] += (meta.height || 0) + innerSpacing;
		}

		let finalHeight = Math.max(...colHeights);
		if (finalHeight > innerSpacing) finalHeight -= innerSpacing;

		const actualHeight = Math.min(finalHeight + outerSpacing * 2, maxHeightLimit);

		await sharp({
			create: {
				width: canvasWidth,
				height: actualHeight,
				channels: 4,
				background: backgroundColor,
			},
		})
			.composite(composites)
			.jpeg({ quality: 90 })
			.toFile(targetPath);

		console.log(`已生成预览图: ${targetPath}`);
	}
}
