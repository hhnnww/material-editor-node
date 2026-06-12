import fs from "node:fs";
import path from "node:path";
import { os } from "@orpc/server";
import z from "zod";

export const orpcMaterialAutoMake = os
	.input(
		z.object({
			shopName: z.string(),
			oriPath: z.string(),
			dstPath: z.string(),
		}),
	)
	.handler(async (ctx) => {
		console.log(ctx.input);

		const oriFolders = fs
			.readdirSync(ctx.input.oriPath, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => path.join(ctx.input.oriPath, dirent.name));

		const dstFolders = fs
			.readdirSync(ctx.input.dstPath, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => path.parse(dirent.name).name);

		const maxNum = dstFolders.reduce((max, name) => {
			const num = Number.parseInt(name.replace(/\D/g, ""), 10);
			return !Number.isNaN(num) && num > max ? num : max;
		}, 0);

		const firstPath = `${ctx.input.dstPath}\\${(maxNum + 1).toString()}`;
		const firstNum = maxNum + 1;

		let currentNum = maxNum;
		for (const folderPath of oriFolders) {
			currentNum++;
			const targetPath = path.join(ctx.input.dstPath, currentNum.toString());
			console.log(`正在移动: ${folderPath} -> ${targetPath}`);
			fs.renameSync(folderPath, targetPath);
		}

		return { success: true, count: currentNum - maxNum, firstPath, firstNum };
	});
