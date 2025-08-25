import { pgTable, serial, varchar, integer, timestamp, text, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 64 }).notNull().unique(),
  stock: integer('stock').notNull().default(0),
  threshold: integer('threshold').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
}, (table) => ({
  // Add indexes for better query performance
  nameIdx: index('products_name_idx').on(table.name),
  skuIdx: index('products_sku_idx').on(table.sku),
  stockIdx: index('products_stock_idx').on(table.stock),
  thresholdIdx: index('products_threshold_idx').on(table.threshold),
  // Composite index for low stock queries
  lowStockIdx: index('products_low_stock_idx').on(table.stock, table.threshold),
}));

export const alertLogs = pgTable('alert_logs', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull(), // FK products.id
  stockBefore: integer('stock_before'),
  stockAfter: integer('stock_after').notNull(),
  threshold: integer('threshold').notNull(),
  channel: text('channel').notNull(),
  dedupeKey: text('dedupe_key').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
}, (table) => ({
  // Add indexes for alert logs
  productIdIdx: index('alert_logs_product_id_idx').on(table.productId),
  createdAtIdx: index('alert_logs_created_at_idx').on(table.createdAt),
  dedupeKeyIdx: index('alert_logs_dedupe_key_idx').on(table.dedupeKey),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type AlertLog = typeof alertLogs.$inferSelect;
