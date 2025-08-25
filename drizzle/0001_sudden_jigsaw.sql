CREATE TABLE "alert_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"stock_before" integer,
	"stock_after" integer NOT NULL,
	"threshold" integer NOT NULL,
	"channel" text NOT NULL,
	"dedupe_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "alert_logs_product_id_idx" ON "alert_logs" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "alert_logs_created_at_idx" ON "alert_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "alert_logs_dedupe_key_idx" ON "alert_logs" USING btree ("dedupe_key");--> statement-breakpoint
CREATE INDEX "products_name_idx" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "products_sku_idx" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "products_stock_idx" ON "products" USING btree ("stock");--> statement-breakpoint
CREATE INDEX "products_threshold_idx" ON "products" USING btree ("threshold");--> statement-breakpoint
CREATE INDEX "products_low_stock_idx" ON "products" USING btree ("stock","threshold");