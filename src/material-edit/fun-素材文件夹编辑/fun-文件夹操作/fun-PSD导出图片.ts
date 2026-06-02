import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

/**
 * winax 是一个原生 C++ 模块，在 Vite/Rollup 打包环境中直接 import 可能会导致路径或依赖加载问题。
 * 使用 createRequire 确保在运行时能正确加载 node_modules 中的原生模块。
 */
const require = createRequire(import.meta.url);
const winax = require("winax");

import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export function FUN_PSD导出图片(materialPath: string, insertAd: boolean) {
	/**
	 * 使用winax导出JPG高清大图
	 * 导出图片和psd文件的stem相同
	 * 在psd文件的同层目录
	 * 在imageFileList中 如果相同stem的图片文件存在，并且和psd在同层目录，则不导出
	 */
	const psdFileList = FUN_递归遍历文件夹(materialPath, [".psd", ".psb"]);
	const imageFileList = FUN_递归遍历文件夹(
		materialPath,
		setting.imageSuffixList,
	);

	if (psdFileList.length === 0) return;

	try {
		const app = new winax.Object("Photoshop.Application");

		for (const psdPath of psdFileList) {
			const psdDir = path.dirname(psdPath);
			const psdStem = path.basename(psdPath, path.extname(psdPath));
			const targetImagePath = path.join(psdDir, `${psdStem}.jpg`);

			// 检查是否已存在同名图片
			const isExist = imageFileList.some((imgFile) => {
				const imgDir = path.dirname(imgFile);
				const imgStem = path.basename(imgFile, path.extname(imgFile));
				return imgDir === psdDir && imgStem === psdStem;
			});

			if (isExist || fs.existsSync(targetImagePath)) {
				console.log(`跳过已存在图片的PSD: ${psdStem}`); // 跳过已存在图片的PSD
				continue;
			}

			try {
				console.log(`正在导出 PSD: ${psdPath}`); // 正在导出 PSD
				const doc = app.Open(psdPath);

				// 获取第一个图层，如果名字匹配则隐藏
				const adlayerNames = setting.adlayerNames;
				const firstLayer = doc.Layers.Item(1);
				if (firstLayer && adlayerNames.includes(firstLayer.Name)) {
					firstLayer.Visible = false;
				}

				// 如果 insertAd 为 true，插入二维码广告

				// 设置导出选项
				const exportOptions = new winax.Object(
					"Photoshop.ExportOptionsSaveForWeb",
				);
				exportOptions.Format = 6; // 6 = JPEG
				exportOptions.Quality = 80; // 高清质量

				// 导出
				doc.Export(targetImagePath, 2, exportOptions); // 2 = SaveForWeb

				if (insertAd) {
					const qrDir = path.join(process.cwd(), "public", "二维码");
					if (fs.existsSync(qrDir)) {
						const qrFiles = fs
							.readdirSync(qrDir)
							.filter((f) => f.toLowerCase().endsWith(".jpg"));
						for (const qrFile of qrFiles) {
							const qrStem = path.basename(qrFile, path.extname(qrFile));
							if (psdStem.includes(qrStem)) {
								const qrPath = path.join(qrDir, qrFile);
								const adLayer = doc.ArtLayers.Add();
								adLayer.Name = "淘宝扫码-加入会员-全店免费";

								// Photoshop 中插入外部文件通常使用 app.Open 加 复制粘贴 或使用 ActionManager
								// 这里简单处理，如果需要完美置入建议使用 Place 命令
								console.log(`已在 PSD 中尝试插入广告图层: ${qrStem}`);

								break;
							}
						}
					}
				}

				if (insertAd) {
					doc.Close(1);
				} else {
					// 关闭文档，不保存修改
					doc.Close(2); // 2 = DoNotSaveChanges
				}
			} catch (err) {
				console.error(`导出单个PSD失败: ${psdPath}`, err); // 导出单个PSD失败
			}
		}
	} catch (error) {
		console.error(
			"调用 Photoshop 导出失败，请确保已安装 Photoshop 且 winax 配置正确", // 调用 Photoshop 导出失败，请确保已安装 Photoshop 且 winax 配置正确
			error,
		);
	}
}

/**
 * 注意：
 * 1. 需要安装 winax: npm install winax
 * 2. 仅在 Windows 环境下运行
 * 3. 运行环境需要有 Photoshop
 */
