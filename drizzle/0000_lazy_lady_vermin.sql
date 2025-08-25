CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(64) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"threshold" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
