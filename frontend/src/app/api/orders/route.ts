import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import verifyToken from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const payload = verifyToken(token || "");

  if (!payload || typeof payload === "string") {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  const body = await req.json();
  const { destination, items } = body;

  if (!destination || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Champs invalides" }, { status: 400 });
  }

  try {
    const orderId = crypto.randomUUID();

    await db.transaction(async (tx) => {
      await tx.insert(orders).values({
        id: orderId,
        destination,
        posted_by: payload.userId,
      });

      for (const item of items) {
        if (!item.item_id || !item.quantity || item.quantity <= 0) {
          throw new Error("Item invalide");
        }

        await tx.insert(orderItems).values({
          order_id: orderId,
          item_id: item.item_id,
          quantity: item.quantity,
        });
      }
    });

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    console.error("Erreur création order:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const payload = verifyToken(token || "");

  if (!payload || typeof payload === "string") {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  const stateParam = req.nextUrl.searchParams.get("state");

  try {
    const whereCondition =
      payload.role === "admin"
        ? undefined
        : eq(orders.posted_by, payload.userId);

    const result = await db.query.orders.findMany({
      where: whereCondition,
      with: {
        orderItems: true,
        postedBy: true,       
        processedBy: true,    
      },
      orderBy: (orders, { desc }) => desc(orders.created_at),
    });

   const finalResult =
  stateParam !== null
    ? result.filter((o) =>
        stateParam.split(",").map(Number).includes(o.state)
      )
    : result;

    return NextResponse.json(finalResult);
  } catch (err) {
    console.error("Erreur lecture orders:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
