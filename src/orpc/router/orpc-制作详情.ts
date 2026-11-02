import { os } from "@orpc/server";
import z from "zod";
import { FUN_初始化分片, FUN_增量写入分片, FUN_最终加水印 } from "#/material-edit/fun-图片功能/fun-直接分片合成保存";
import { XQ_分批生成效果图Composites, XQ_生成效果图固定层, XQ_计算效果图布局 } from "#/material-edit/xq-制作详情/xq-制作效果图";
import { XQ_分批生成预览图Composites, XQ_生成预览图固定层, XQ_计算预览图布局 } from "#/material-edit/xq-制作详情/xq-制作预览图";
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
		const isEffectEnabled = ctx.input.制作效果图 === "制作" && ctx.input.effectImageList.length > 0;
		const isPreviewEnabled = ctx.input.制作预览图 === "制作" && ctx.input.previewImageList.length > 0;
		console.log(`[制作详情] 开始处理：效果图=${isEffectEnabled}(${ctx.input.effectImageList.length}张), 预览图=${isPreviewEnabled}(${ctx.input.previewImageList.length}张)`);
		let startNum = 2;
		if (isEffectEnabled) {
			console.log("[制作详情] === 开始处理效果图（分批模式） ===");
			const layout = await XQ_计算效果图布局(ctx.input);
			const fixedComposites = await XQ_生成效果图固定层(layout);
			await FUN_初始化分片(layout.width, layout.totalHeight, fixedComposites, startNum);
			for await (const batch of XQ_分批生成效果图Composites(ctx.input, layout)) {
				await FUN_增量写入分片(layout.width, layout.totalHeight, batch.composites, startNum);
			}
			await FUN_最终加水印(layout.width, layout.totalHeight, startNum);
			const parts = Math.ceil(layout.totalHeight / 2000);
			startNum += parts;
			console.log("[制作详情] 效果图完成");
		}
		if (isPreviewEnabled) {
			console.log("[制作详情] === 开始处理预览图（分批模式） ===");
			const layout = await XQ_计算预览图布局(ctx.input);
			const fixedComposites = await XQ_生成预览图固定层(layout);
			await FUN_初始化分片(layout.width, layout.totalHeight, fixedComposites, startNum);
			for await (const batch of XQ_分批生成预览图Composites(ctx.input, layout)) {
				await FUN_增量写入分片(layout.width, layout.totalHeight, batch.composites, startNum);
			}
			await FUN_最终加水印(layout.width, layout.totalHeight, startNum);
			const parts = Math.ceil(layout.totalHeight / 2000);
			startNum += parts;
			console.log("[制作详情] 预览图完成");
		}
		return ctx.input;
	});
