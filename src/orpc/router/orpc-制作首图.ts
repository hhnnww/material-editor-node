import { os } from "@orpc/server";
import z from "zod";
import { FUN_保存图片 } from "#/material-edit/fun-图片功能/fun-保存图片";
import { ST_1大1小 } from "#/material-edit/st-制作首图/st-制作布局/st-1大1小";
import { ST_1大列2小列 } from "#/material-edit/st-制作首图/st-制作布局/st-1大列-2小列";
import { ST_列_固定尺寸 } from "#/material-edit/st-制作首图/st-制作布局/st-列-固定尺寸";
import { ST_列自适应 } from "#/material-edit/st-制作首图/st-制作布局/st-列自适应";
import { ST_固定裁剪 } from "#/material-edit/st-制作首图/st-制作布局/st-固定裁剪";
import { ST_横版1221 } from "#/material-edit/st-制作首图/st-制作布局/st-横版1221";
import { ST_竖版1221 } from "#/material-edit/st-制作首图/st-制作布局/st-竖版1221";
import { ST_行固定尺寸 } from "#/material-edit/st-制作首图/st-制作布局/st-行固定尺寸";
import { ST_行自适应 } from "#/material-edit/st-制作首图/st-制作布局/st-行自适应";
import { RUN_制作黑鲸首图 } from "#/material-edit/st-制作首图/st-黑鲸/run-制作黑鲸首图";

export const ORPC_制作首图 = os
	.input(
		z.object({
			title: z.string(),
			imageList: z.array(
				z.object({
					imagePath: z.string(),
					width: z.number(),
					height: z.number(),
					imageRatio: z.number(),
				}),
			),
			rows: z.number(),
			innerSpacing: z.number(),
			outerSpacing: z.number(),
			style: z.string(),
			layout: z.string(),
			borderRadius: z.number(),
			format: z.string(),
			background: z.string(),
			shopName: z.string(),
			currentStem: z.string(),
			nameNum: z.number(),
		}),
	)
	.handler(async (ctx) => {
		const layoutMap: Record<string, () => Promise<Buffer>> = {
			ST_固定裁剪: async () => await ST_固定裁剪({ ...ctx.input }),
			ST_1大_1小: async () => await ST_1大1小({ ...ctx.input }),
			ST_横版_1221: async () => await ST_横版1221({ ...ctx.input }),
			ST_列_自适应: async () => await ST_列自适应(ctx.input),
			ST_1大列2小列: async () => await ST_1大列2小列(ctx.input),
			ST_行_自适应: async () => await ST_行自适应(ctx.input),
			ST_行_固定尺寸: async () => await ST_行固定尺寸(ctx.input),
			ST_列_固定尺寸: async () => await ST_列_固定尺寸(ctx.input),
			ST_竖版_1221: async () => await ST_竖版1221(ctx.input),
		};

		const layoutIm = await layoutMap[ctx.input.layout]();

		if (ctx.input.style === "黑鲸") {
			const st = await RUN_制作黑鲸首图({
				bg: layoutIm,
				title: ctx.input.title,
				format:
					ctx.input.format === "psd"
						? "ps"
						: ctx.input.format === "pptx"
							? "ppt"
							: ctx.input.format,
				background: ctx.input.background,
				shopName: ctx.input.shopName,
				currentStem: ctx.input.currentStem,
			});
			await FUN_保存图片(st, `st_${ctx.input.nameNum}`, false);
		}

		return ctx.input;
	});
