import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const winax = require("winax");

import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export function FUN_AI导出图片(materialPath: string) {
	/**
	 * 使用winax把ai和eps导出jpg图片
	 * 分别导出源文件中的多个画板
	 * 最短边的长度设置为2000px
	 */
	const aiEpsFileList = FUN_递归遍历文件夹(materialPath, [".ai", ".eps"]);

	if (aiEpsFileList.length === 0) return;

	try {
		const app = new winax.Object("Illustrator.Application");
		// 设置用户交互级别为不可见/忽略警告，防止弹出“无法找到链接的文件”等对话框
		// -1 = UserInteractionLevel.DISPLAY_NO_ALERTS
		app.UserInteractionLevel = -1;

		for (let index = 0; index < aiEpsFileList.length; index++) {
			const filePath = aiEpsFileList[index];
			try {
				const fileDir = path.dirname(filePath);
				const fileStem = path.basename(filePath, path.extname(filePath));
				const targetPathBase = path.join(fileDir, `${fileStem}.jpg`);

				// 先判断源文件对应的素材图（主图）是否存在，如果已存在则跳过该文件
				if (fs.existsSync(targetPathBase)) {
					console.log(`跳过已存在预览图的 AI/EPS: ${fileStem}`); // 跳过已存在预览图的 AI/EPS
					continue;
				}

				console.log(
					`[${index + 1}/${aiEpsFileList.length}] 正在导出 AI/EPS: ${fileStem}`, // 正在导出 AI/EPS
				);
				const doc = app.Open(filePath);

				// 检查颜色模式，如果是 CMYK (1) 则转换为 RGB (2)
				// DocumentColorSpace: 1 = CMYK, 2 = RGB
				if (doc.DocumentColorSpace === 1) {
					app.ExecuteMenuCommand("doc-color-rgb");
				}

				// 获取第一个图层，如果名字匹配则隐藏
				const adlayerNames = ["淘宝:小夕素材", "删除这个图层，即可开始编辑。"];
				const firstLayer = doc.Layers.Item(1);
				if (firstLayer && adlayerNames.includes(firstLayer.Name)) {
					firstLayer.Visible = false;
				}

				// 遍历画板
				const artboards = doc.Artboards;
				for (let i = 0; i < artboards.Count; i++) {
					const artboard = artboards.Item(i + 1);
					doc.Artboards.SetActiveArtboardIndex(i);

					// 计算缩放比例以满足最短边 2000px
					const rect = artboard.ArtboardRect; // [left, top, right, bottom]
					const abWidth = Math.abs(rect[2] - rect[0]);
					const abHeight = Math.abs(rect[1] - rect[3]);
					const minSide = Math.min(abWidth, abHeight);
					const scale = (2000 / minSide) * 100; // Illustrator 导出比例是百分比

					// 设置导出选项
					const exportOptions = new winax.Object(
						"Illustrator.ExportOptionsJPEG",
					);
					exportOptions.AntiAliasing = true;
					exportOptions.QualitySetting = 80;
					exportOptions.Optimization = true;
					exportOptions.VerticalScale = scale;
					exportOptions.HorizontalScale = scale;
					exportOptions.ArtBoardClipping = true; // 只导出当前画板内容

					// 构造导出路径：单画板直接用文件名，多画板加索引
					const suffix = artboards.Count > 1 ? `_${i + 1}` : "";
					const targetPath = path.join(fileDir, `${fileStem}${suffix}.jpg`);

					// 如果图片已存在则跳过
					if (fs.existsSync(targetPath)) {
						continue;
					}

					// 1 = ExportType.JPEG
					doc.Export(targetPath, 1, exportOptions);
				}

				// 关闭文档，不保存修改 (2 = SaveOptions.DoNotSaveChanges)
				doc.Close(2);
			} catch (err) {
				console.error(`导出文件失败: ${filePath}`, err);
			}
		}
	} catch (error) {
		console.error(
			"调用 Illustrator 导出失败，请确保已安装 Illustrator 且 winax 配置正确",
			error,
		);
	}
}
