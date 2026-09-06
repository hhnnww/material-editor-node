import path from "node:path";
import { os } from "@orpc/server";
import z from "zod";
import { FUN_创建文件夹 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹初始化/fun-创建文件夹";
import { FUN_AI导出图片 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-AI导出图片";
import { FUN_EPS文件转AI文件 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-eps文件转ai文件";
import { FUN_PSD_删除广告_导出图片 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-PSD-删除广告-导出图片.ts";
import { FUN_PSD导出图片 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-PSD-导出图片.ts";
import { FUN_享设计制作预览图 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-享设计制作预览图";
import { FUN_享设计文件夹重构 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-享设计文件夹重构";
import { FUN_删除EPS文件 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-删除EPS文件";
import { FUN_删除广告文件 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-删除广告文件";
import { FUN_删除文件夹内所有图片 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-删除素材文件夹内所有图片";
import { FUN_图片转PSD } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-图片转PSD";
import { FUN_复制到预览图 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-复制到预览图";
import { FUN_复制效果图片到剪切板 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-复制效果图到剪切板";
import { FUN_子文件夹源文件重命名 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-子文件夹源文件重命名";
import { FUN_子目录移动到根目录 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-子目录内容移动到根";
import { FUN_子目录图片横向排列 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-子目录图片横向排列";
import { FUN_子目录图片重命名 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-子目录图片重命名";
import { FUN_子目录重命名 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-子目录重命名";
import { FUN_PPT导出图片 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-导出PPTX图片";
import { FUN_打开文件夹 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-打开文件夹";
import { FUN_打开桌面上传文件夹 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-打开桌面上传文件夹";
import { FUN_打开没有预览图的AI文件 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-打开没有预览图的AI文件";
import { FUN_打开没有预览图的PSD文件 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-PSD-打开没有预览图的psd文件.ts";
import { FUN_打开素材大目录 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-打开素材大目录";
import { FUN_文件重命名 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-文件重命名";
import { moveImagesToEffectFolder } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-移动到效果图";
import { FUN_移动到数字目录 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-移动到数字目录";
import { FUN_移动到根目录 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-移动到根目录";
import { FUN_素材图水印 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-素材图水印";
import { unzipFiles } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-解压ZIP";

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

		const actionName = ctx.input.actionName;

		switch (actionName) {
			case "打开素材文件夹":
				FUN_打开文件夹(folderStructure.materialPath);
				break;
			case "打开效果图文件夹":
				FUN_打开文件夹(folderStructure.effectPath);
				break;
			case "移动到根目录":
				FUN_移动到根目录([folderStructure.materialPath, folderStructure.previewPath, path.join(folderStructure.thumbPath, "预览图")]);
				break;
			case "移动到效果图":
				await moveImagesToEffectFolder(folderStructure.materialPath, folderStructure.effectPath, folderStructure.thumbPath);
				break;
			case "解压ZIP":
				unzipFiles(folderStructure.materialPath);
				break;
			case "文件重命名":
				FUN_文件重命名(folderStructure.materialPath, ctx.input.shopName);
				break;
			case "删除广告文件":
				FUN_删除广告文件(folderStructure.materialPath);
				break;
			case "PSD导出图片":
				FUN_PSD导出图片(folderStructure.materialPath, false, ctx.input.shopName);
				break;
			case "复制到预览图":
				await FUN_复制到预览图(folderStructure.materialPath, folderStructure.previewPath, folderStructure.thumbPath);
				break;
			case "删除素材文件夹内所有图片":
				FUN_删除文件夹内所有图片([folderStructure.materialPath]);
				break;
			case "删除预览图":
				FUN_删除文件夹内所有图片([folderStructure.previewPath, `${folderStructure.thumbPath}/预览图`]);
				break;
			case "删除效果图":
				FUN_删除文件夹内所有图片([folderStructure.effectPath, `${folderStructure.thumbPath}/效果图`]);
				break;
			case "PPT导出图片":
				FUN_PPT导出图片(folderStructure.materialPath);
				break;
			case "子目录内容移动到根":
				FUN_子目录移动到根目录(folderStructure.materialPath);
				break;
			case "子目录重命名":
				FUN_子目录重命名(folderStructure.materialPath, ctx.input.shopName);
				break;
			case "享设计文件夹重构":
				FUN_享设计文件夹重构(folderStructure.materialPath);
				break;
			case "子文件夹源文件重命名":
				FUN_子文件夹源文件重命名(folderStructure.materialPath);
				break;
			case "打开没有预览图的AI文件":
				FUN_打开没有预览图的AI文件(folderStructure.materialPath);
				break;
			case "AI导出图片":
				FUN_AI导出图片(folderStructure.materialPath, false);
				break;
			case "享设计制作预览图":
				await FUN_享设计制作预览图(folderStructure.materialPath);
				break;
			case "图片转PSD":
				FUN_图片转PSD(folderStructure.materialPath);
				break;
			case "打开没有预览图的PSD文件":
				FUN_打开没有预览图的PSD文件(folderStructure.materialPath);
				break;
			case "打开桌面上传文件夹":
				FUN_打开桌面上传文件夹();
				break;
			case "打开小夕素材大目录":
				FUN_打开素材大目录("小夕素材");
				break;
			case "打开饭桶设计大目录":
				FUN_打开素材大目录("饭桶设计");
				break;
			case "打开泡泡素材大目录":
				FUN_打开素材大目录("泡泡素材");
				break;
			case "子目录图片重命名":
				FUN_子目录图片重命名(folderStructure.materialPath);
				break;
			case "PSD导出图片—插入广告":
				FUN_PSD导出图片(folderStructure.materialPath, true, ctx.input.shopName);
				break;
			case "AI导出图片-插入广告":
				FUN_AI导出图片(folderStructure.materialPath, true);
				break;
			case "素材图水印":
				await FUN_素材图水印(folderStructure.materialPath, ctx.input.shopName);
				break;
			case "PSD删除广告_导出图片":
				FUN_PSD_删除广告_导出图片(folderStructure.materialPath, ctx.input.shopName);
				break;
			case "删除EPS文件":
				FUN_删除EPS文件(folderStructure.materialPath);
				break;
			case "移动到数字目录":
				FUN_移动到数字目录({
					folderList: [folderStructure.materialPath, folderStructure.previewPath, path.join(folderStructure.thumbPath, "预览图")],
				});
				break;
			case "子目录图片横向拼接":
				FUN_子目录图片横向排列({ materialPath: folderStructure.materialPath });
				break;
			case "EPS文件转AI文件":
				await FUN_EPS文件转AI文件({
					materialPath: folderStructure.materialPath,
				});
				break;
			case "复制效果图":
				FUN_复制效果图片到剪切板({
					effectPath: folderStructure.effectPath,
				});
				break;
		}

		return { success: true, actionName: ctx.input.actionName, refresh: false };
	});
