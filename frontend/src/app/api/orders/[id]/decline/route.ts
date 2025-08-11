import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import verifyToken from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const payload = verifyToken(token || "");

  if (!payload || typeof payload === "string" || payload.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const orderId = context.params.id;

  try {
    const result = await db
      .update(orders)
      .set({ state: 2 , processed_by:payload.sub }) // 2 = declined
      .where(eq(orders.id, orderId));

    return NextResponse.json({ success: true, declined: true });
  } catch (err) {
    console.error("Erreur lors du refus de la commande :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
