import fs from "node:fs";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { setting } from "#/setting";

export async function FUN_享设计制作预览图(materialPath: string) {
	const innerSpacing = 20;
	const outerSpacing = 20;
	const targetWidth = 2000;

	const maxHeightLimit = 30000;

	const items = fs.readdirSync(materialPath);
	const subDirs = items
		.map((item) => path.join(materialPath, item))
		.filter((fullPath) => fs.statSync(fullPath).isDirectory());

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

		const metas = await Promise.all(
			imageFiles.map((img) => sharp(img).metadata()),
		);

		const composites: OverlayOptions[] = [];

		// 计算所有图片在统一宽度（targetWidth）下的总高度，用于决定布局
		let totalHeightAtFullWidth = 0;
		for (const m of metas) {
			const h = Math.round(((m.height || 1) * targetWidth) / (m.width || 1));
			totalHeightAtFullWidth += h;
		}

		// 目标是让总宽高比接近 3:4 (宽:高)。
		// 假设排列成 n 列，则单图宽度 w = targetWidth / n
		// 总高度 H = (totalHeightAtFullWidth / n) / n = totalHeightAtFullWidth / (n^2)
		// 我们希望 targetWidth / H ≈ 3/4  => H ≈ (4/3) * targetWidth
		// totalHeightAtFullWidth / (n^2) ≈ (4/3) * targetWidth => n^2 ≈ totalHeightAtFullWidth / (1.333 * targetWidth)
		const idealCols = Math.max(
			1,
			Math.round(
				Math.sqrt(
					totalHeightAtFullWidth / ((4 / 3) * (targetWidth - outerSpacing * 2)),
				),
			),
		);
		const cols = idealCols;
		const itemWidth = Math.floor(
			(targetWidth - outerSpacing * 2 - (cols - 1) * innerSpacing) / cols,
		);

		const colHeights = new Array(cols).fill(0);

		for (let i = 0; i < imageFiles.length; i++) {
			// 总是把下一张图放在当前最短的那一列
			const shortestCol = colHeights.indexOf(Math.min(...colHeights));

			const buffer = await sharp(imageFiles[i]).resize(itemWidth).toBuffer();
			const meta = await sharp(buffer).metadata();

			const x = outerSpacing + shortestCol * (itemWidth + innerSpacing);
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

		const actualHeight = Math.min(
			finalHeight + outerSpacing * 2,
			maxHeightLimit,
		);

		await sharp({
			create: {
				width: targetWidth,
				height: actualHeight,
				channels: 4,
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			},
		})
			.composite(composites)
			.jpeg({ quality: 90 })
			.toFile(targetPath);

		console.log(`已生成预览图: ${targetPath}`);
	}
}
