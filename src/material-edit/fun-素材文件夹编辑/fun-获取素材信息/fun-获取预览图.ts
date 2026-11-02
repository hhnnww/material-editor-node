import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size"; // 改为引入通用的 imageSize
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

type output = {
	imagePath: string;
	thumbPath: string;
	materialName: string;
	materialImagePath: string;
	width: number;
	height: number;
	imageRatio: number;
}[];
export async function FUN_获取预览图(props: { materialPath: string; previewPath: string; thumbPath: string }) {
	/**
	 * 根据素材图查找对应的素材源文件,他们在同层文件夹，素材文件的stem in 素材图stem
	 * 根据素材图查找对应的预览图，他们在文件夹结构一致，name一致
	 * 根据预览图查找对应的缩略图，他们name一致文件夹结构一致
	 * 缩略图文件夹 F:\小夕素材\11000-11999\11824\缩略图
	 * 那么预览图对应的缩略图文件夹就是 F:\小夕素材\11000-11999\11824\缩略图\预览图
	 * 预览图对应的缩略图文件名一致，相对路径也是一致的
	 */
	const previewImageList = FUN_递归遍历文件夹(props.previewPath, setting.imageSuffixList);
	const materialFileList = FUN_递归遍历文件夹(props.materialPath, setting.materialSuffixList);
	const previewThumbPath = path.join(props.thumbPath, "预览图");
	console.log(`[预览图诊断] materialPath=${props.materialPath}`);
	console.log(`[预览图诊断] materialFileList 数量=${materialFileList.length}`);
	console.log(`[预览图诊断] materialFileList=${JSON.stringify(materialFileList.slice(0, 30), null, 0)}`);
	console.log(`[预览图诊断] previewImageList 数量=${previewImageList.length}`);
	console.log(`[预览图诊断] previewImageList=${JSON.stringify(previewImageList.slice(0, 30), null, 0)}`);
	const result: output = [];
	for (const previewPath of previewImageList) {
		const relativePath = path.relative(props.previewPath, previewPath);
		const targetThumbPath = path.join(previewThumbPath, relativePath);
		// 只有当缩略图存在时才处理
		if (fs.existsSync(targetThumbPath)) {
			try {
				const buffer = fs.readFileSync(previewPath);
				const dimensions = imageSize(buffer);
				if (dimensions.width && dimensions.height) {
					// 查找对应的素材源文件名称 (stem)
					// 预览图文件名即为素材文件名或包含素材文件名
					const previewExt = path.extname(previewPath);
					const previewStem = path.basename(previewPath, previewExt);
					// 去掉多图后缀（子目录重命名时第二个起追加 _1, _2...）
					// 例如 小夕素材(005)_1 -> 小夕素材(005)
					const materialStem = previewStem.replace(/_\d+$/, "").toLowerCase();
					const foundMaterialPath =
						materialFileList.find((filePath) => {
							const ext = path.extname(filePath);
							const stem = path.basename(filePath, ext);
							return stem.toLowerCase() === materialStem;
						}) ||
						materialFileList.find((filePath) => {
							const ext = path.extname(filePath);
							const stem = path.basename(filePath, ext);
							return stem.toLowerCase().includes(materialStem);
						});
					const foundMaterial = foundMaterialPath ? path.basename(foundMaterialPath) : undefined;
					const materialName = foundMaterial || path.basename(previewPath);
					if (!foundMaterial) {
						const nearStems = materialFileList.slice(0, 20).map((p) => path.basename(p));
						console.log(`[预览图匹配失败] previewStem=${previewStem} materialStem=${materialStem} 素材总数=${materialFileList.length} 前20个=${JSON.stringify(nearStems)}`);
					}
					// 查找对应的素材图路径
					const materialImagePath = path.join(props.materialPath, relativePath);
					result.push({
						imagePath: previewPath,
						thumbPath: targetThumbPath,
						materialName: materialName,
						materialImagePath: fs.existsSync(materialImagePath) ? materialImagePath : "",
						width: dimensions.width,
						height: dimensions.height,
						imageRatio: dimensions.width / dimensions.height,
					});
				}
			} catch (error) {
				console.error(`获取预览图尺寸失败: ${previewPath}`, error);
			}
		} else {
			console.warn(`未找到对应的预览缩略图: ${targetThumbPath}`);
		}
	}
	result.sort((a, b) => b.imageRatio - a.imageRatio);
	return result;
}
