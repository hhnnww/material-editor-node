import fs from "node:fs";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { setting } from "#/setting";

export async function FUN_享设计制作预览图(materialPath: string) {
	/**
	 * 遍历materialPath的子目录
	 * 分别遍历子目录里面的图片
	 * 如果只有一张图片
	 * 复制到mateiralPath目录下
	 * 如果有多张图片
	 * 计算图片的平均比例
	 * 如果图片平均比例是长图
	 * 则横向粘贴到一张图片上
	 * 如果是宽图或者是正方形图片
	 * 则竖向粘贴到一张图片
	 * 把图片保存到materialpath的目录下
	 * 图片保存格式jpg
	 * 图片名就是子目录的stem
	 */
	const innerSpacing = 0;
	const outerSpacing = 0;
	const targetWidth = 2000;

	const items = fs.readdirSync(materialPath);
	const subDirs = items
		.map((item) => path.join(materialPath, item))
		.filter((fullPath) => fs.statSync(fullPath).isDirectory());

	for (const subDir of subDirs) {
		const subDirStem = path.basename(subDir);
		const imageFiles = fs
			.readdirSync(subDir)
			.filter((file) =>
				setting.imageSuffixList.includes(path.extname(file).toLowerCase()),
			)
			.map((file) => path.join(subDir, file));

		if (imageFiles.length === 0) continue;

		const targetPath = path.join(materialPath, `${subDirStem}.jpg`);

		// 多张图片处理
		const metas = await Promise.all(
			imageFiles.map((img) => sharp(img).metadata()),
		);
		const ratios = metas.map((m) => (m.width || 1) / (m.height || 1));
		const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;

		const composites: OverlayOptions[] = [];
		const finalWidth = targetWidth;
		let finalHeight = 0;

		if (avgRatio < 0.8) {
			// 长图：横向排列
			const itemWidth = Math.floor(
				(targetWidth -
					outerSpacing * 2 -
					(imageFiles.length - 1) * innerSpacing) /
					imageFiles.length,
			);
			let maxHeight = 0;

			for (let i = 0; i < imageFiles.length; i++) {
				const buffer = await sharp(imageFiles[i]).resize(itemWidth).toBuffer();
				const meta = await sharp(buffer).metadata();
				const x = outerSpacing + i * (itemWidth + innerSpacing);

				composites.push({
					input: buffer,
					left: x,
					top: outerSpacing,
				});
				maxHeight = Math.max(maxHeight, meta.height || 0);
			}
			finalHeight = maxHeight + outerSpacing * 2;
		} else {
			// 宽图或正方形：竖向排列
			const itemWidth = targetWidth - outerSpacing * 2;
			let currentY = outerSpacing;

			for (let i = 0; i < imageFiles.length; i++) {
				const buffer = await sharp(imageFiles[i]).resize(itemWidth).toBuffer();
				const meta = await sharp(buffer).metadata();

				composites.push({
					input: buffer,
					left: outerSpacing,
					top: currentY,
				});
				currentY += (meta.height || 0) + innerSpacing;
			}
			finalHeight = currentY - innerSpacing + outerSpacing;
		}

		// 限制最大高度，防止图片过长
		if (finalHeight > 10000) {
			// 如果太长了，重新按比例缩小整体
			const scale = 10000 / finalHeight;
			const scaledComposites = await Promise.all(
				composites.map(async (c) => {
					const b = await sharp(c.input as Buffer)
						.resize({
							width: Math.floor(
								(await sharp(c.input as Buffer).metadata()).width! * scale,
							),
						})
						.toBuffer();
					return {
						input: b,
						left: Math.floor(c.left! * scale),
						top: Math.floor(c.top! * scale),
					};
				}),
			);
			await sharp({
				create: {
					width: Math.floor(finalWidth * scale),
					height: 10000,
					channels: 4,
					background: { r: 255, g: 255, b: 255, alpha: 1 },
				},
			})
				.composite(scaledComposites)
				.jpeg({ quality: 90 })
				.toFile(targetPath);
		} else {
			await sharp({
				create: {
					width: finalWidth,
					height: finalHeight,
					channels: 4,
					background: { r: 255, g: 255, b: 255, alpha: 1 },
				},
			})
				.composite(composites)
				.jpeg({ quality: 90 })
				.toFile(targetPath);
		}
	}
}
