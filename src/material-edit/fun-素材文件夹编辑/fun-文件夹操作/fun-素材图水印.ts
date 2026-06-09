import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export async function FUN_素材图水印(materialPath: string, shopName: string) {
	const imageFileList = FUN_递归遍历文件夹(
		materialPath,
		setting.imageSuffixList,
	);

	// 水印图片在public目录下的二维码目录，是shopname.jpg
	const watermarkPath = path.join(
		process.cwd(),
		"public",
		"二维码",
		`${shopName}.jpg`,
	);

	const watermarkBuffer = await sharp(watermarkPath).toBuffer();

	for (const imgPath of imageFileList) {
		const parentDirName = path.basename(path.dirname(imgPath)).toLowerCase();

		// 如果图片的父文件夹是stem是links，则不处理
		if (parentDirName.toLocaleLowerCase() === "links") {
			continue;
		}

		try {
			console.log(`正在处理图片水印: ${imgPath}`);
			const image = sharp(imgPath).resize(1200);
			const metadata = await image.metadata();

			if (metadata.width && metadata.height) {
				// 调整水印大小，通常为原图宽度的 1/5
				const watermarkWidth = Math.floor(metadata.width / 5);
				const resizedWatermark = await sharp(watermarkBuffer)
					.resize(watermarkWidth)
					.toBuffer();

				const buffer = await image
					.composite([
						{
							input: resizedWatermark,
							gravity: "southeast", // 右下角
						},
					])
					.toBuffer();
				await sharp(buffer).toFile(`${imgPath}.tmp`);
				fs.renameSync(`${imgPath}.tmp`, imgPath);
			}
		} catch (error) {
			console.error(`添加水印失败: ${imgPath}`, error);
		}
	}
}
