import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, prospect
  lastContact: timestamp("last_contact"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const followUps = pgTable("follow_ups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  scheduledDate: varchar("client_id").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  type: text("type").notNull(), // call, email, meeting, proposal
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id"),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  priority: text("priority").default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
});

export const interactions = pgTable("interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  type: text("type").notNull(), // call, email, meeting, note
  subject: text("subject").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Supermarket Data Models
export const supermarkets = pgTable("supermarkets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  size: text("size").notNull(), // small, medium, large
  type: text("type").notNull(), // chain, independent, franchise
  createdAt: timestamp("created_at").defaultNow(),
});

export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supermarketId: varchar("supermarket_id").notNull(),
  date: timestamp("date").notNull(),
  category: text("category").notNull(), // groceries, electronics, clothing, etc.
  product: text("product").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // stored in cents
  totalAmount: integer("total_amount").notNull(), // stored in cents
  paymentMethod: text("payment_method").notNull(), // cash, card, digital
  customerAge: integer("customer_age"),
  customerGender: text("customer_gender"), // male, female, other
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supermarketId: varchar("supermarket_id").notNull(),
  product: text("product").notNull(),
  category: text("category").notNull(),
  currentStock: integer("current_stock").notNull(),
  minimumStock: integer("minimum_stock").notNull(),
  lastRestocked: timestamp("last_restocked"),
  supplier: text("supplier").notNull(),
  costPrice: integer("cost_price").notNull(), // stored in cents
  sellingPrice: integer("selling_price").notNull(), // stored in cents
  createdAt: timestamp("created_at").defaultNow(),
});

export const customerTraffic = pgTable("customer_traffic", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supermarketId: varchar("supermarket_id").notNull(),
  date: timestamp("date").notNull(),
  hour: integer("hour").notNull(), // 0-23
  visitorCount: integer("visitor_count").notNull(),
  avgTransactionValue: integer("avg_transaction_value").notNull(), // stored in cents
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertFollowUpSchema = createInsertSchema(followUps).omit({
  id: true,
  createdAt: true,
  completed: true,
  completedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completed: true,
  completedAt: true,
});

export const insertInteractionSchema = createInsertSchema(interactions).omit({
  id: true,
  createdAt: true,
});

export const insertSupermarketSchema = createInsertSchema(supermarkets).omit({
  id: true,
  createdAt: true,
});

export const insertSalesSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerTrafficSchema = createInsertSchema(customerTraffic).omit({
  id: true,
  createdAt: true,
});

// Types
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type FollowUp = typeof followUps.$inferSelect;
export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;

export type Supermarket = typeof supermarkets.$inferSelect;
export type InsertSupermarket = z.infer<typeof insertSupermarketSchema>;

export type Sales = typeof sales.$inferSelect;
export type InsertSales = z.infer<typeof insertSalesSchema>;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type CustomerTraffic = typeof customerTraffic.$inferSelect;
export type InsertCustomerTraffic = z.infer<typeof insertCustomerTrafficSchema>;
