import fs from "node:fs";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { setting } from "#/setting";

export async function FUN_享设计制作预览图(materialPath: string) {
	const innerSpacing = 60;
	const outerSpacing = 60;
	const itemWidth = 1200;
	const backgroundColor = "#ffffff";
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

		const resizedBuffers: Buffer[] = [];
		const resizedHeights: number[] = [];
		for (const imageFile of imageFiles) {
			const buffer = singleImage ? await sharp(imageFile).toBuffer() : await sharp(imageFile).resize(actualItemWidth).toBuffer();
			const meta = await sharp(buffer).metadata();
			resizedBuffers.push(buffer);
			resizedHeights.push(meta.height || 0);
		}

		const colItems: number[][] = Array.from({ length: cols }, () => []);
		const colHeights = new Array(cols).fill(0);

		for (let i = 0; i < imageFiles.length; i++) {
			const shortestCol = colHeights.indexOf(Math.min(...colHeights));
			colItems[shortestCol].push(i);
			colHeights[shortestCol] += resizedHeights[i] + innerSpacing;
		}

		// 图片按列数均分，每种数量对应一种奇偶行序，取两种行序中较矮的一种，保证每列图片数量相同且列高一致
		const orders: number[][][] = [];
		for (const items of colItems) {
			const orderA: number[] = [];
			const orderB: number[] = [];
			for (let i = 0; i < items.length; i += 2) orderA.push(items[i]);
			for (let i = 1; i < items.length; i += 2) orderA.push(items[i]);
			for (let i = 1; i < items.length; i += 2) orderB.push(items[i]);
			for (let i = 0; i < items.length; i += 2) orderB.push(items[i]);
			orders.push([orderA, orderB]);
		}

		let bestOrders = orders.map(([orderA]) => orderA);
		let bestHeight = Infinity;
		const comboCount = 2 ** cols;

		for (let combo = 0; combo < comboCount; combo++) {
			const candidate = orders.map(([orderA, orderB], col) => ((combo >> col) & 1 ? orderB : orderA));
			let maxHeight = 0;
			for (const order of candidate) {
				let height = 0;
				for (let i = 0; i < order.length; i++) height += resizedHeights[order[i]] + (i > 0 ? innerSpacing : 0);
				maxHeight = Math.max(maxHeight, height);
			}
			if (maxHeight < bestHeight) {
				bestHeight = maxHeight;
				bestOrders = candidate;
			}
		}

		for (let col = 0; col < cols; col++) {
			let top = 0;
			for (let i = 0; i < bestOrders[col].length; i++) {
				const index = bestOrders[col][i];
				composites.push({
					input: resizedBuffers[index],
					left: outerSpacing + col * (actualItemWidth + innerSpacing),
					top: outerSpacing + top,
				});
				top += resizedHeights[index] + innerSpacing;
			}
		}

		const actualHeight = Math.min(bestHeight + outerSpacing * 2, maxHeightLimit);

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
