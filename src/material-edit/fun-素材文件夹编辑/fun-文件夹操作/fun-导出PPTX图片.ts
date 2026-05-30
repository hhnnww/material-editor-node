import { execSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";

const require = createRequire(import.meta.url);
const winax = require("winax");

import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export async function FUN_PPT导出图片(materialPath: string) {
	/**
	 * 遍历ppt和pptx文件
	 * 把ppt和pptx使用winax导出图片到 ppt 文件 父文件夹下/ppt文件stem 文件夹中
	 */
	const pptFileList = FUN_递归遍历文件夹(materialPath, [".ppt", ".pptx"]);

	if (pptFileList.length === 0) {
		console.log("未找到 PPT 或 PPTX 文件");
		return;
	}

	try {
		const app = new winax.Object("PowerPoint.Application");

		for (const pptPath of pptFileList) {
			const pptDir = path.dirname(pptPath);
			const pptStem = path.basename(pptPath, path.extname(pptPath));
			const exportDir = path.join(pptDir, pptStem);

			if (!fs.existsSync(exportDir)) {
				fs.mkdirSync(exportDir, { recursive: true });
			}

			try {
				console.log(`正在导出 PPT: ${pptPath}`); // 正在导出 PPT
				const pres = app.Presentations.Open(pptPath, -1, 0, 0); // ReadOnly, Untitled, WithWindow

				// 导出为 JPG (PowerPoint 的 Export 方法会根据路径导出所有幻灯片)
				pres.Export(exportDir, "JPG");
				pres.Close();

				// 等待文件系统同步，确保图片已完全写入磁盘
				let retry = 0;
				while (fs.readdirSync(exportDir).length === 0 && retry < 10) {
					await new Promise((resolve) => setTimeout(resolve, 500));
					retry++;
				}
			} catch (err) {
				console.error(`导出单个PPT失败: ${pptPath}`, err); // 导出单个PPT失败
			}

			// 1. 获取导出的图片列表
			let exportedImages = FUN_递归遍历文件夹(
				exportDir,
				setting.imageSuffixList,
			);

			if (exportedImages.length === 0) {
				console.log(`PPT 导出目录为空，等待1秒后重试: ${exportDir}`);
				await new Promise((resolve) => setTimeout(resolve, 1000));
				exportedImages = FUN_递归遍历文件夹(exportDir, setting.imageSuffixList);
				if (exportedImages.length === 0) {
					console.log(`重试后 PPT 导出目录仍为空: ${exportDir}`);
					continue;
				}
			}

			// 2. 获取前7张图片
			const targetImages = exportedImages.slice(0, 7);
			const firstImg = sharp(targetImages[0]);
			const firstMeta = await firstImg.metadata();

			const innerSpacing = 10;
			const outerSpacing = 10;
			const cols = 2;

			const width = (firstMeta.width || 1920) + outerSpacing * 2;
			const bigImageWidth = firstMeta.width || 1920;
			const bigImageHeight = firstMeta.height || 1080;

			// 计算下方小图的宽度和高度 (2列)
			const smallWidth = Math.floor((bigImageWidth - innerSpacing) / cols);
			// 保持比例缩放小图高度
			const smallHeight = Math.floor(
				(smallWidth / (firstMeta.width || 1)) * (firstMeta.height || 1),
			);

			const composites: OverlayOptions[] = [];

			// 放置第一张大图 (顶部)
			composites.push({
				input: await firstImg.toBuffer(),
				top: outerSpacing,
				left: outerSpacing,
			});

			// 放置后续图片 (2列3排)
			const currentY = outerSpacing + bigImageHeight + innerSpacing;
			for (let i = 1; i < targetImages.length; i++) {
				const idx = i - 1;
				const row = Math.floor(idx / cols);
				const col = idx % cols;

				const x = outerSpacing + col * (smallWidth + innerSpacing);
				const y = currentY + row * (smallHeight + innerSpacing);

				const imgBuffer = await sharp(targetImages[i])
					.resize(smallWidth, smallHeight)
					.toBuffer();

				composites.push({
					input: imgBuffer,
					top: y,
					left: x,
				});
			}

			// 计算总高度
			const totalRows = Math.ceil((targetImages.length - 1) / cols);
			const totalHeight =
				currentY +
				totalRows * smallHeight +
				(totalRows - 1) * innerSpacing +
				outerSpacing;

			// 3. 合成并保存
			const finalImagePath = path.join(pptDir, `${pptStem}.jpg`);
			await sharp({
				create: {
					width: width,
					height: totalHeight,
					channels: 4,
					background: { r: 255, g: 255, b: 255, alpha: 1 },
				},
			})
				.composite(composites)
				.jpeg({ quality: 90 })
				.toFile(finalImagePath);

			// 4. 删除临时导出文件夹
			try {
				console.log(`正在删除临时文件夹: ${exportDir}`); // 正在删除临时文件夹
				execSync(`rd /s /q "${exportDir}"`);
			} catch (e) {
				console.error(`删除临时文件夹失败: ${exportDir}`, e); // 删除临时文件夹失败
			}
		}
	} catch (error) {
		console.error("调用 PowerPoint 导出失败，请确保已安装 PowerPoint", error); // 调用 PowerPoint 导出失败，请确保已安装 PowerPoint
	}
}
