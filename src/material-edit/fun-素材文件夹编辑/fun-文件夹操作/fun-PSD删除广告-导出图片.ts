import { createRequire } from "node:module";
import { setting } from "#/setting";
import { FUN_当前PSD导出JPG } from "../fun-ps操作/fun-PSD_当前导出JPG";
import { FUN_PSD_插入广告 } from "../fun-ps操作/fun-PSD_插入广告";
import { FUN_判断源文件是否有素材图 } from "../fun-判断源文件是否有素材图";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

const require = createRequire(import.meta.url);
const winax = require("winax");

export function FUN_PSD_删除广告_导出图片(
	materialPath: string,
	shopName: string,
) {
	const adlayerNames = setting.adlayerNames;
	const adlayerNameReplaces = setting.psAdLayerNameReplayceList;
	const psdFileList = FUN_递归遍历文件夹(materialPath, [".psd", ".psb"]);
	console.log(`找到 PSD 文件列表:`, psdFileList);

	if (psdFileList.length === 0) return;

	try {
		const app = new winax.Object("Photoshop.Application");
		app.DisplayDialogs = 3;

		for (const psdPath of psdFileList) {
			// 检查是否已存在同名图片
			const isExist = FUN_判断源文件是否有素材图({ materialFile: psdPath });

			if (isExist) {
				console.log(`跳过已存在图片的PSD: ${psdPath}`);
				continue;
			}

			try {
				console.log(`正在导出 PSD: ${psdPath}`);
				const doc = app.Open(psdPath);

				/**
				 * 递归遍历所有图层
				 * 采用【图层收集 -> 统一删除】或【稳健单层判断】
				 */
				const processLayers = (layers: any) => {
					if (!layers || layers.Count === 0) return;

					// 使用倒序遍历
					for (let i = layers.Count; i >= 1; i--) {
						const layer = layers.Item(i);
						if (!layer) continue;

						const typeName = String(layer.typename).trim();
						const layerName = String(layer.Name).trim();

						// 1. 如果是图层组 (LayerSet)，先递归进去
						if (typeName === "LayerSet") {
							processLayers(layer.Layers);
							continue;
						}

						// 2. 如果是普通图层 (ArtLayer)
						if (typeName === "ArtLayer") {
							if (layer.Kind !== 2 && adlayerNames.includes(layerName)) {
								console.log(`[匹配成功] 准备删除广告图层: ${layerName}`);

								if (layer.AllLocked) {
									layer.AllLocked = false;
								}

								layer.Delete();
							} else if (layer.Kind === 2) {
								// 2 代表 LayerKind.TEXT 文字图层
								const textItem = layer.TextItem;
								let contents = String(textItem.Contents).toUpperCase();
								for (const item of adlayerNameReplaces) {
									if (contents.includes(item.ori.toUpperCase())) {
										console.log(
											`[文字替换] ${item.ori.toUpperCase()} -> ${item.dst.toUpperCase()}`,
										);
										textItem.Font = "IBMPlexSansSC-Light";
										contents = contents.replaceAll(
											item.ori.toUpperCase(),
											item.dst.toLowerCase(),
										);
										textItem.Contents = contents.toLowerCase();
									}
								}
							}
						}
					}
				};

				// 执行图层清理
				processLayers(doc.Layers);

				FUN_当前PSD导出JPG({ materialPath: psdPath });

				// --- 插入广告二维码逻辑开始 ---
				FUN_PSD_插入广告(shopName);
				// --- 插入广告二维码逻辑结束 ---

				doc.Close(1);
			} catch (err) {
				console.error(`导出单个PSD失败: ${psdPath}`, err);
			}
		}
	} catch (error) {
		console.error(
			"调用 Photoshop 导出失败，请确保已安装 Photoshop 且 winax 配置正确",
			error,
		);
	}
}
