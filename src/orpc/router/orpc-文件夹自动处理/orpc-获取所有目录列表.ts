import fs from "node:fs";
import path from "node:path";
import { os } from "@orpc/server";
import z from "zod";

export const orpc_获取所有目录列表 = os
	.input(
		z.object({
			dstPath: z.string(),
			firstNum: z.number(),
		}),
	)
	.handler(async (ctx) => {
		const { dstPath, firstNum } = ctx.input;

		const directories = fs
			.readdirSync(dstPath, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => {
				const stem = path.parse(dirent.name).name;
				const num = Number.parseInt(stem.replace(/\D/g, ""), 10);
				return { stem, num, fullPath: path.join(dstPath, dirent.name) };
			})
			.filter((item) => !Number.isNaN(item.num) && item.num >= firstNum)
			.sort((a, b) => a.num - b.num);

		return directories;
	});
