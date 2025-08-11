// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { items, orders, inventories, inventoryItems } from "@/db/schema";
import { count, desc, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const [{ c: itemsCount }] = await db.select({ c: count() }).from(items);
    const [{ c: inventoriesCount }] = await db.select({ c: count() }).from(inventories);

    const [{ c: ordersPending }] = await db
      .select({ c: count() })
      .from(orders)
      .where(eq(orders.state, 0));

    const [{ c: ordersValidated }] = await db
      .select({ c: count() })
      .from(orders)
      .where(eq(orders.state, 1));

    const lowStock = await db
      .select({
        id: inventoryItems.itemId,
        name: items.name,
        stock: inventoryItems.stock,
        threshold: inventoryItems.threshold,
        image_url: items.image_url,
      })
      .from(inventoryItems)
      .innerJoin(items, eq(inventoryItems.itemId, items.id))
      .innerJoin(inventories, eq(inventoryItems.inventoryId, inventories.id))
      .where(sql`coalesce(${inventoryItems.stock}, 0) < coalesce(${inventoryItems.threshold}, 0)`)
      .orderBy(desc(inventoryItems.threshold))
      .limit(5);

    const recentOrdersRaw = await db
      .select({
        id: orders.id,
        destination: orders.destination,
        status: orders.state,
        created_at: orders.created_at,
      })
      .from(orders)
      .orderBy(desc(orders.created_at))
      .limit(8);

    const recentOrders = recentOrdersRaw.map(o => ({
      ...o,
      created_at: o.created_at instanceof Date ? o.created_at.toISOString() : String(o.created_at),
    }));

    const ordersByState = await db
      .select({ state: orders.state, count: count() })
      .from(orders)
      .where(sql`created_at >= now() + interval '-30 days'`)
      .groupBy(orders.state)
      .orderBy(orders.state);

    return NextResponse.json({
      stats: {
        items: Number(itemsCount ?? 0),
        inventories: Number(inventoriesCount ?? 0),
        ordersPending: Number(ordersPending ?? 0),
        ordersValidated: Number(ordersValidated ?? 0),
        alerts: lowStock.length,
      },
      lowStock,
      recentOrders,
      charts: { ordersByState },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Dashboard error" }, { status: 500 });
  }
}
