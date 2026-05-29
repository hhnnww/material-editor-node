import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

type itemList = {
	materialFile: string;
	materialImageList: string[];
}[];

export function FUN_文件重命名(materialPath: string, shopName: string) {
	/**
	 * 修改成shopName(001)要有3位数
	 */
	const materialFileList = FUN_递归遍历文件夹(
		materialPath,
		setting.materialSuffixList,
	);
	const imageFileList = FUN_递归遍历文件夹(
		materialPath,
		setting.imageSuffixList,
	);

	const itemList: itemList = materialFileList.map((mFile) => {
		const mDir = path.dirname(mFile);
		const mStem = path.basename(mFile, path.extname(mFile));

		// 查找同目录下，文件名包含素材文件主文件名的图片
		const relatedImages = imageFileList.filter((imgFile) => {
			const imgDir = path.dirname(imgFile);
			const imgStem = path.basename(imgFile, path.extname(imgFile));
			return imgDir === mDir && imgStem.includes(mStem);
		});

		return {
			materialFile: mFile,
			materialImageList: relatedImages,
		};
	});

	// 如果没有找到素材源文件，则将所有图片视为独立项进行重命名
	if (itemList.length === 0 && imageFileList.length > 0) {
		const renamePasses = [{ prefix: `${nanoid()}_` }, { prefix: shopName }];

		for (const pass of renamePasses) {
			for (let i = 0; i < imageFileList.length; i++) {
				const oldPath = imageFileList[i];
				const indexStr = (i + 1).toString().padStart(3, "0");
				const ext = path.extname(oldPath);
				const newPath = path.join(
					path.dirname(oldPath),
					`${pass.prefix}(${indexStr})${ext}`,
				);
				if (fs.existsSync(oldPath)) {
					fs.renameSync(oldPath, newPath);
					imageFileList[i] = newPath;
				}
			}
		}
		return;
	}

	// 两次重命名：第一次用 nanoid 防止冲突，第二次用 shopName
	const renamePasses = [
		{ prefix: `${nanoid()}_`, useIndex: true },
		{ prefix: shopName, useIndex: true },
	];

	for (const pass of renamePasses) {
		for (let i = 0; i < itemList.length; i++) {
			const item = itemList[i];
			const indexStr = (i + 1).toString().padStart(3, "0");
			const baseName = `${pass.prefix}(${indexStr})`;

			// 1. 重命名素材文件
			const mExt = path.extname(item.materialFile);
			const newMPath = path.join(
				path.dirname(item.materialFile),
				baseName + mExt,
			);
			if (fs.existsSync(item.materialFile)) {
				fs.renameSync(item.materialFile, newMPath);
				item.materialFile = newMPath;
			}

			// 2. 重命名关联图片
			const newImagePaths: string[] = [];
			item.materialImageList.forEach((imgFile, imgIdx) => {
				const iExt = path.extname(imgFile);
				// 第一张为 name.jpg, 后续为 name_1.jpg, name_2.jpg...
				const imgName = imgIdx === 0 ? baseName : `${baseName}_${imgIdx}`;
				const newIPath = path.join(path.dirname(imgFile), imgName + iExt);

				if (fs.existsSync(imgFile)) {
					fs.renameSync(imgFile, newIPath);
					newImagePaths.push(newIPath);
				}
			});
			item.materialImageList = newImagePaths;
		}
	}
}
