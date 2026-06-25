import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export async function FUN_素材图水印(materialPath: string, shopName: string) {
	const imageFileList = FUN_递归遍历文件夹(materialPath, setting.imageSuffixList);

	// 水印图片在public目录下的二维码目录，是shopname.jpg
	const watermarkPath = path.join(process.cwd(), "public", "二维码", `${shopName}.jpg`);

	const watermarkBuffer = await sharp(watermarkPath).toBuffer();
	const concurrencyLimit = 10; // 同时处理10张图片

	const tasks = imageFileList.map(async (imgPath) => {
		const parentDirName = path.basename(path.dirname(imgPath)).toLowerCase();

		if (parentDirName === "links") return;

		try {
			const image = sharp(imgPath);
			const metadata = await image.metadata();

			if (metadata.width && metadata.height) {
				const targetWidth = 1200;
				const watermarkWidth = Math.floor(targetWidth / 5);

				const resizedWatermark = await sharp(watermarkBuffer).resize(watermarkWidth).toBuffer();

				const buffer = await sharp(imgPath)
					.resize(targetWidth)
					.composite([
						{
							input: resizedWatermark,
							gravity: "southeast",
						},
					])
					.toBuffer();

				await sharp(buffer).toFile(`${imgPath}.tmp`);
				fs.renameSync(`${imgPath}.tmp`, imgPath);
				console.log(`水印处理完成: ${path.basename(imgPath)}`);
			}
		} catch (error) {
			console.error(`添加水印失败: ${imgPath}`, error);
		}
	});

	// 使用简单的分批并行处理
	for (let i = 0; i < tasks.length; i += concurrencyLimit) {
		await Promise.all(tasks.slice(i, i + concurrencyLimit));
	}
}
