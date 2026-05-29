import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

const require = createRequire(import.meta.url);
const winax = require("winax");

export function FUN_图片转PSD(materialPath: string) {
	/**
	 * 遍历图片列表
	 * 使用ps打开图片
	 * 解锁背景图层
	 * 把psd另存为同层文件夹同stem的psd文件
	 * 关闭psd文档
	 * 删除图片
	 */
	const imageFileList = FUN_递归遍历文件夹(
		materialPath,
		setting.imageSuffixList,
	);

	if (imageFileList.length === 0) return;

	try {
		const app = new winax.Object("Photoshop.Application");

		for (const imgPath of imageFileList) {
			try {
				const imgDir = path.dirname(imgPath);
				const imgStem = path.basename(imgPath, path.extname(imgPath));
				const targetPsdPath = path.join(imgDir, `${imgStem}.psd`);

				const doc = app.Open(imgPath);

				// 解锁背景图层 (背景图层通常是第一个图层且 isBackgroundLayer 为 true)
				const bgLayer = doc.Layers.Item(1);
				if (bgLayer.isBackgroundLayer) {
					bgLayer.isBackgroundLayer = false;
				}

				// 设置 PSD 保存选项
				const psdSaveOptions = new winax.Object(
					"Photoshop.PhotoshopSaveOptions",
				);
				psdSaveOptions.Layers = true;

				// 另存为 PSD
				doc.SaveAs(targetPsdPath, psdSaveOptions, true);

				// 关闭文档 (2 = DoNotSaveChanges)
				doc.Close(2);

				// 删除原图片
				fs.unlinkSync(imgPath);
				console.log(`已将图片转换为PSD并删除原图: ${imgStem}`);
			} catch (err) {
				console.error(`转换图片失败: ${imgPath}`, err);
			}
		}
	} catch (error) {
		console.error("调用 Photoshop 失败，请确保已安装 Photoshop", error);
	}
}
