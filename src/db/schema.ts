import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const materials = pgTable(
	"materials",
	{
		id: serial().primaryKey(),

		url: text("url").notNull().unique(),
		image: text("image").notNull().unique(),
		site_id: integer("site_id").references(() => site_name.id),
		shop_id: integer("shop_id").references(() => shop_name.id),
		state: boolean().notNull().default(false),
		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => [
		// 定义外键约束
		foreignKey({
			columns: [table.site_id],
			foreignColumns: [site_name.id],
			name: "materials_site_id_fk",
		}),
		foreignKey({
			columns: [table.shop_id],
			foreignColumns: [shop_name.id],
			name: "materials_shop_id_fk",
		}),
	],
);

export const shop_name = pgTable("shop_name", {
	id: serial().primaryKey(),
	name: text("name").notNull().unique(),

	createdAt: timestamp("created_at").defaultNow(),
});

export const site_name = pgTable("site_name", {
	id: serial().primaryKey(),
	name: text("name").notNull().unique(),
	url: text("url").notNull().unique(),
	desc: text("desc").notNull().default(""),

	createdAt: timestamp("created_at").defaultNow(),
});
