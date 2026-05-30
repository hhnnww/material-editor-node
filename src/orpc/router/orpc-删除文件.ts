import { os } from "@orpc/server";
import z from "zod";
import { FUN_删除文件 } from "#/material-edit/fun-素材文件夹编辑/fun-文件夹操作/fun-删除文件";

export const ORPC_删除文件 = os
	.input(z.array(z.string()))
	.handler(async ({ input }) => {
		FUN_删除文件(input);

		return { success: true };
	});
