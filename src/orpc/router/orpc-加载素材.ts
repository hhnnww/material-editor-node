import { os } from "@orpc/server";
import z from "zod";
import { FUN_创建文件夹 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹初始化/fun-创建文件夹";
import { FUN_验证文件夹 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹初始化/fun-验证文件夹";
import { FUN_从效果图生成到缩略图 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-从效果图生成到缩略图";
import { FUN_获取上下文件夹 } from "#/material-edit/fun-素材文件夹编辑/fun-获取素材信息/fun-获取上下文件夹";
import { FUN_获取效果图 } from "#/material-edit/fun-素材文件夹编辑/fun-获取素材信息/fun-获取效果图";
import { FUN_获取素材格式 } from "#/material-edit/fun-素材文件夹编辑/fun-获取素材信息/fun-获取素材格式";
import { FUN_获取预览图 } from "#/material-edit/fun-素材文件夹编辑/fun-获取素材信息/fun-获取预览图";

export const ORPC_加载素材 = os
	.input(
		z.object({
			rootPath: z.string(),
			shopName: z.string(),
		}),
	)
	.handler(async (ctx) => {
		const res = FUN_验证文件夹(ctx.input.rootPath);
		if (!res.success) {
			throw new Error(res.message);
		}
		const folderStructure = FUN_创建文件夹(ctx.input.rootPath);
		const effectImageList = await FUN_获取效果图(
			folderStructure.effectPath,
			folderStructure.thumbPath,
		);
		const previewImageList = await FUN_获取预览图({
			materialPath: folderStructure.materialPath,
			previewPath: folderStructure.previewPath,
			thumbPath: folderStructure.thumbPath,
		});
		const materialFormatWithCount = FUN_获取素材格式(
			folderStructure.materialPath,
		);
		const folderNav = await FUN_获取上下文件夹(ctx.input.rootPath);
		await FUN_从效果图生成到缩略图(
			folderStructure.effectPath,
			folderStructure.thumbPath,
		);
		return {
			folderStructure,
			effectImageList,
			previewImageList,
			materialFormatWithCount,
			folderNav,
			refresh: true,
			shopName: ctx.input.shopName,
			rootPath: ctx.input.rootPath,
		};
	});
