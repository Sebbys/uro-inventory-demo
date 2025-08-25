-- Create alert_logs table for low stock notifications dedupe and audit
CREATE TABLE IF NOT EXISTS "alert_logs" (
    "id" serial PRIMARY KEY,
    "product_id" integer NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "stock_before" integer,
    "stock_after" integer NOT NULL,
    "threshold" integer NOT NULL,
    "channel" text NOT NULL,
    "dedupe_key" text NOT NULL UNIQUE,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Useful index for querying a product's recent alerts
CREATE INDEX IF NOT EXISTS "idx_alert_logs_product_id_created_at" ON "alert_logs" ("product_id", "created_at" DESC);
