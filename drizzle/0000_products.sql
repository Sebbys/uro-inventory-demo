-- drizzle-kit migration: create products table
CREATE TABLE IF NOT EXISTS "products" (
    "id" serial PRIMARY KEY,
    "name" varchar(255) NOT NULL,
    "sku" varchar(64) NOT NULL UNIQUE,
    "stock" integer NOT NULL DEFAULT 0,
    "threshold" integer NOT NULL DEFAULT 0,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);
