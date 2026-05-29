import { os } from "@orpc/server";
import z from "zod";
import { FUN_创建文件夹 } from "#/fun-素材文件夹编辑/fun-文件夹初始化/fun-创建文件夹";
import { FUN_AI导出图片 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-AI导出图片";
import { FUN_PSD导出图片 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-PSD导出图片";
import { FUN_享设计制作预览图 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-享设计制作预览图";
import { FUN_享设计文件夹重构 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-享设计文件夹重构";
import { FUN_删除广告文件 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-删除广告文件";
import { FUN_删除文件夹内所有图片 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-删除素材文件夹内所有图片";
import { FUN_图片转PSD } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-图片转PSD";
import { FUN_复制到预览图 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-复制到预览图";
import { FUN_子文件夹源文件重命名 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-子文件夹源文件重命名";
import { FUN_子目录移动到根目录 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-子目录内容移动到根";
import { FUN_子目录重命名 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-子目录重命名";
import { FUN_PPT导出图片 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-导出PPTX图片";
import { FUN_打开文件夹 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-打开文件夹";
import { FUN_打开没有预览图的AI文件 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-打开没有预览图的AI文件";
import { FUN_打开没有预览图的PSD文件 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-打开没有预览图的PSD文件";
import { FUN_文件重命名 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-文件重命名";
import { FUN_移动到效果图 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-移动到效果图";
import { FUN_移动到根目录 } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-移动到根目录";
import { FUN_解压ZIP } from "#/fun-素材文件夹编辑/fun-文件夹操作/fun-解压ZIP";

export const ORPC_文件夹操作 = os
	.input(
		z.object({
			rootPath: z.string(),
			shopName: z.string(),
			actionName: z.string(),
		}),
	)
	.handler(async (ctx) => {
		const folderStructure = FUN_创建文件夹(ctx.input.rootPath);
		console.log(`正在执行操作: ${ctx.input.actionName}`);
		const actionMap: Record<string, () => void> = {
			打开素材文件夹: () => FUN_打开文件夹(folderStructure.materialPath),
			移动到根目录: () => FUN_移动到根目录(folderStructure.materialPath),
			移动到效果图: () =>
				FUN_移动到效果图(
					folderStructure.materialPath,
					folderStructure.effectPath,
					folderStructure.thumbPath,
				),
			解压ZIP: () => FUN_解压ZIP(folderStructure.materialPath),
			文件重命名: () =>
				FUN_文件重命名(folderStructure.materialPath, ctx.input.shopName),
			删除广告文件: () => FUN_删除广告文件(folderStructure.materialPath),
			PSD导出图片: () => FUN_PSD导出图片(folderStructure.materialPath),
			复制到预览图: () =>
				FUN_复制到预览图(
					folderStructure.materialPath,
					folderStructure.previewPath,
					folderStructure.thumbPath,
				),
			删除素材文件夹内所有图片: async () =>
				await FUN_删除文件夹内所有图片([folderStructure.materialPath]),
			删除预览图: async () =>
				await FUN_删除文件夹内所有图片([
					folderStructure.previewPath,
					`${folderStructure.thumbPath}/预览图`,
				]),
			删除效果图: async () =>
				await FUN_删除文件夹内所有图片([
					folderStructure.effectPath,
					`${folderStructure.thumbPath}/效果图`,
				]),
			PPT导出图片: async () => {
				await FUN_PPT导出图片(folderStructure.materialPath);
			},
			子目录内容移动到根: () => {
				FUN_子目录移动到根目录(folderStructure.materialPath);
			},
			子目录重命名: () =>
				FUN_子目录重命名(folderStructure.materialPath, ctx.input.shopName),
			享设计文件夹重构: () =>
				FUN_享设计文件夹重构(folderStructure.materialPath),
			子文件夹源文件重命名: () =>
				FUN_子文件夹源文件重命名(folderStructure.materialPath),
			打开没有预览图的AI文件: () =>
				FUN_打开没有预览图的AI文件(folderStructure.materialPath),
			AI导出图片: () => FUN_AI导出图片(folderStructure.materialPath),
			享设计制作预览图: () =>
				FUN_享设计制作预览图(folderStructure.materialPath),
			图片转PSD: () => FUN_图片转PSD(folderStructure.materialPath),
			打开没有预览图的PSD文件: () =>
				FUN_打开没有预览图的PSD文件(folderStructure.materialPath),
		};

		if (actionMap[ctx.input.actionName]) {
			await actionMap[ctx.input.actionName]();
		}

		return { success: true, actionName: ctx.input.actionName };
	});
