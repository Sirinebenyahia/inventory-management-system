import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import verifyToken from "@/lib/auth";
import { items as itemsTable } from "@/db/schema";

const getOrder = async (orderId: string) => {
  return await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      orderItems: {
        with: {
          item: {
            with: {
              inventoryItems: { with: { inventory: true } },
            },
          },
        },
      },
    },
  });
};

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const payload = verifyToken(token || "");

  if (!payload || typeof payload === "string") {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  const orderId = context.params.id; // Simplified to avoid await if params is synchronous

  try {
    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // Vérifier accès : admin ou propriétaire
    if (payload.role !== "admin" && payload.userId !== order.posted_by) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error("Erreur GET order by ID:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export type GetOrderByIDResponse = Awaited<ReturnType<typeof getOrder>>;