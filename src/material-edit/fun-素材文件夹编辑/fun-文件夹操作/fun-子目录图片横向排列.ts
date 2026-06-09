import fs from "node:fs";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { setting } from "#/setting";

export async function FUN_子目录图片横向排列(props: { materialPath: string }) {
	/**
	 * 遍历所有子目录
	 * 从子目录遍历所有图片
	 * 把子目录的图片全部横向排列
	 * 全部顶部对齐
	 * 生成的图片保存在 materialPath 下，以子目录名命名
	 */
	const innerSpacing = 20;
	const outerSpacing = 0;
	const maxHeightLimit = 1000;

	const items = fs.readdirSync(props.materialPath);
	const subDirs = items
		.map((item) => path.join(props.materialPath, item))
		.filter((fullPath) => fs.statSync(fullPath).isDirectory());

	for (const subDir of subDirs) {
		const subDirStem = path.basename(subDir);
		const targetPath = path.join(props.materialPath, `${subDirStem}.jpg`);
		if (fs.existsSync(targetPath)) continue;

		const imageFiles = fs
			.readdirSync(subDir)
			.filter((file) => {
				const ext = path.extname(file).toLowerCase();
				return setting.imageSuffixList.includes(ext);
			})
			.map((file) => path.join(subDir, file));

		if (imageFiles.length === 0) continue;

		if (imageFiles.length === 1) {
			fs.copyFileSync(imageFiles[0], targetPath);
			console.log(`单图子目录，已直接复制: ${targetPath}`);
			continue;
		}

		const composites: OverlayOptions[] = [];
		let currentX = outerSpacing;
		let maxRowHeight = 0;

		for (const imgPath of imageFiles) {
			const img = sharp(imgPath);
			const meta = await img.metadata();
			const buffer = await img.toBuffer();

			const imgWidth = meta.width || 0;
			const imgHeight = meta.height || 0;

			// 如果图片高度超过限制，则进行缩放，防止 composite 报错
			if (imgHeight > maxHeightLimit - outerSpacing * 2) {
				const targetH = maxHeightLimit - outerSpacing * 2;
				const resizedBuffer = await sharp(buffer)
					.resize({ height: targetH })
					.toBuffer();
				composites.push({
					input: resizedBuffer,
					left: currentX,
					top: outerSpacing,
				});
				currentX += Math.round((imgWidth * targetH) / imgHeight) + innerSpacing;
				maxRowHeight = Math.max(maxRowHeight, targetH);
				continue;
			}

			composites.push({
				input: buffer,
				left: currentX,
				top: outerSpacing,
			});

			currentX += imgWidth + innerSpacing;
			maxRowHeight = Math.max(maxRowHeight, imgHeight);
		}

		const canvasWidth = currentX - innerSpacing + outerSpacing;
		const canvasHeight = Math.min(
			maxRowHeight + outerSpacing * 2,
			maxHeightLimit,
		);

		await sharp({
			create: {
				width: canvasWidth,
				height: canvasHeight,
				channels: 4,
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			},
		})
			.composite(composites)
			.jpeg({ quality: 90 })
			.toFile(targetPath);

		console.log(`已生成横向排列图: ${targetPath}`);
	}
}
