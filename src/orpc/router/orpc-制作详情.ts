import { os } from "@orpc/server";
import z from "zod";
import { FUN_循环保存图片 } from "#/fun-图片功能/fun-循环保存图片";
import { XQ_制作效果图 } from "#/xq-制作详情/xq-制作效果图";
import { XQ_制作预览图 } from "#/xq-制作详情/xq-制作预览图";

export const ORPC_制作详情 = os
	.input(
		z.object({
			effectImageList: z.array(
				z.object({
					imagePath: z.string(),
					thumbpath: z.string(),
					imageRatio: z.number(),
					width: z.number(),
					height: z.number(),
				}),
			),
			previewImageList: z.array(
				z.object({
					imagePath: z.string(),
					thumbPath: z.string(),
					materialName: z.string(),
					width: z.number(),
					height: z.number(),
					imageRatio: z.number(),
				}),
			),
			rows: z.number(),
			innerSpacing: z.number(),
			outerSpacing: z.number(),
			borderRadius: z.number(),
			制作效果图: z.string(),
			制作预览图: z.string(),
		}),
	)
	.handler(async (ctx) => {
		let startNum = 2;
		if (
			ctx.input.制作效果图 === "制作" &&
			ctx.input.effectImageList.length > 0
		) {
			console.log("正在制作效果图详情...");
			const effectImg = await XQ_制作效果图({ ...ctx.input });
			startNum = await FUN_循环保存图片(effectImg, startNum);
		}

		if (
			ctx.input.制作预览图 === "制作" &&
			ctx.input.previewImageList.length > 0
		) {
			console.log("正在制作预览图详情...");
			const previewImg = await XQ_制作预览图({ ...ctx.input });
			await FUN_循环保存图片(previewImg, startNum);
		}

		return ctx.input;
	});
