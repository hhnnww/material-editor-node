import { os } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "#/db";
import { materials, shop_name, site_name } from "#/db/schema";

export const orpcMateralList = os
	.input(
		z.object({
			shopName: z.string(),
			siteName: z.string(),
			pageNum: z.number().int().min(1),
		}),
	)
	.handler(async (ctx) => {
		const shopId = await db
			.select()
			.from(shop_name)
			.where(eq(shop_name.name, ctx.input.shopName));
		const siteId = await db
			.select()
			.from(site_name)
			.where(eq(site_name.name, ctx.input.siteName));
		if (!shopId || !siteId) return null;
		return await db
			.select()
			.from(materials)
			.where(
				and(
					eq(materials.shop_id, shopId[0].id),
					eq(materials.site_id, siteId[0].id),
					eq(materials.state, false),
				),
			)
			.limit(120)
			.offset((ctx.input.pageNum - 1) * 120);
	});
