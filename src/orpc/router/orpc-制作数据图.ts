import { os } from "@orpc/server";
import z from "zod";
import { FUN_保存图片 } from "#/fun-图片功能/fun-保存图片";
import { FUN_清空上传文件夹 } from "#/fun-图片功能/fun-清空上传文件夹";
import { XQ_制作数据图 } from "#/xq-制作详情/xq-制作数据图";

export const ORPC_制作数据图 = os
	.input(
		z.array(
			z.object({
				name: z.string(),
				content: z.string(),
			}),
		),
	)
	.handler(async (ctx) => {
		await FUN_清空上传文件夹();
		console.log(ctx.input);
		const dataBg = await XQ_制作数据图(ctx.input);
		await FUN_保存图片(dataBg, "xq_1", false);
		return { success: true };
	});
