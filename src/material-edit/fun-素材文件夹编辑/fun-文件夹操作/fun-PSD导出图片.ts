import winax from "winax";
import { setting } from "#/setting";
import { FUN_当前PSD导出JPG } from "../fun-ps操作/fun-PSD_当前导出JPG";
import { FUN_PSD_插入广告 } from "../fun-ps操作/fun-PSD_插入广告";
import { FUN_判断源文件是否有素材图 } from "../fun-判断源文件是否有素材图";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

/**
 * 遍历指定目录下的 PSD/PSB 文件并导出为 JPG 图片
 * @param materialPath 素材根目录路径
 * @param insertAd 是否插入广告二维码
 * @param shopName 店铺名称（用于查找对应的二维码）
 */
export function FUN_PSD导出图片(
	materialPath: string,
	insertAd: boolean,
	shopName: string,
) {
	const psdFileList = FUN_递归遍历文件夹(materialPath, [".psd", ".psb"]);

	if (psdFileList.length === 0) return;

	const app = new winax.Object("Photoshop.Application");

	for (const psdPath of psdFileList) {
		// 检查是否已存在同名图片
		const isExist = FUN_判断源文件是否有素材图({ materialFile: psdPath });

		if (isExist) {
			console.log(`跳过已存在图片的PSD: ${psdPath}`); // 如果图片已存在，则跳过该 PSD 的处理
			continue;
		}

		console.log(`正在导出 PSD: ${psdPath}`); // 开始执行导出流程
		const doc = app.Open(psdPath);

		// 获取第一个图层，如果名字匹配则隐藏
		const adlayerNames = setting.adlayerNames;
		const firstLayer = doc.Layers.Item(1);
		if (firstLayer && adlayerNames.includes(firstLayer.Name)) {
			firstLayer.Visible = false;
		}

		FUN_当前PSD导出JPG({ materialPath: psdPath });

		if (insertAd) {
			FUN_PSD_插入广告(shopName);
		}

		if (insertAd) {
			doc.Close(1);
		} else {
			doc.Close(2);
		}
	}
}
