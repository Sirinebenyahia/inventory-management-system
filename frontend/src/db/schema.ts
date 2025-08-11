import { pgTable, uuid, varchar, timestamp, text, integer, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 🔐 TABLE : Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("user"), // "admin" ou "user"
  phoneNumber: varchar("phone_number", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// 📦 TABLE : Items
export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  desc: text("desc"),
  metadata: json("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: uuid("created_by").notNull(),
  updatedAt: timestamp("updated_at"),
  updatedBy: uuid("updated_by"),
  deletedAt: timestamp("deleted_at"),
  deletedBy: uuid("deleted_by"),
  image_url: text("image_url"),
});

// 🏬 TABLE : Inventories
export const inventories = pgTable("inventories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 📊 TABLE : InventoryItems (pivot)
export const inventoryItems = pgTable("inventory_items", {
  inventoryId: uuid("inventory_id").notNull().references(() => inventories.id),
  itemId: uuid("item_id").notNull().references(() => items.id),
  stock: integer("stock").notNull(),
  threshold: integer("threshold").notNull(),
});

// 📑 TABLE : Orders
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  destination: varchar("destination", { length: 100 }).notNull(),
  posted_by: uuid("posted_by").notNull().references(() => users.id),
  processed_by: uuid("processed_by").references(() => users.id), // Nullable
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  state: integer("state").default(0).notNull(), // 0 = en attente, 1 = validée, 2 = refusée
});

// 🧾 TABLE : Order Items
export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  order_id: uuid("order_id").notNull().references(() => orders.id),
  item_id: uuid("item_id").notNull().references(() => items.id),
  quantity: integer("quantity").notNull(),
});

// 🧾 TABLE : OrderInventoryAssignments
export const orderInventoryAssignments = pgTable("order_inventory_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  order_id: uuid("order_id").notNull().references(() => orders.id),
  item_id: uuid("item_id").notNull().references(() => items.id),
  inventory_id: uuid("inventory_id").notNull().references(() => inventories.id),
  quantity: integer("quantity").notNull(),
});


// 📎 RELATIONS

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  orderItems: many(orderItems),
  postedBy: one(users, {
    fields: [orders.posted_by],
    references: [users.id],
  }),
  processedBy: one(users, {
    fields: [orders.processed_by],
    references: [users.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  item: one(items, {
    fields: [orderItems.item_id],
    references: [items.id],
  }),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  inventory: one(inventories, {
    fields: [inventoryItems.inventoryId],
    references: [inventories.id],
  }),
  item: one(items, {
    fields: [inventoryItems.itemId],
    references: [items.id],
  }),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  inventoryItems: many(inventoryItems),
}));

export const inventoriesRelations = relations(inventories, ({ many }) => ({
  inventoryItems: many(inventoryItems),
}));

export const orderInventoryAssignmentsRelations = relations(orderInventoryAssignments, ({ one }) => ({
  order: one(orders, {
    fields: [orderInventoryAssignments.order_id],
    references: [orders.id],
  }),
  item: one(items, {
    fields: [orderInventoryAssignments.item_id],
    references: [items.id],
  }),
  inventory: one(inventories, {
    fields: [orderInventoryAssignments.inventory_id],
    references: [inventories.id],
  }),
}));
