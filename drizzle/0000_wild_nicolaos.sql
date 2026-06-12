CREATE TABLE "materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"image" text NOT NULL,
	"site_id" integer,
	"shop_id" integer,
	"state" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "materials_url_unique" UNIQUE("url"),
	CONSTRAINT "materials_image_unique" UNIQUE("image")
);
--> statement-breakpoint
CREATE TABLE "shop_name" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "shop_name_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "site_name" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "site_name_name_unique" UNIQUE("name"),
	CONSTRAINT "site_name_url_unique" UNIQUE("url")
);
--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_site_id_site_name_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."site_name"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_shop_id_shop_name_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shop_name"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."site_name"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shop_name"("id") ON DELETE no action ON UPDATE no action;