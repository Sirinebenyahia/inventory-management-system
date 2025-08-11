import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  orders,
  orderInventoryAssignments,
  inventoryItems,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import verifyToken from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const payload = verifyToken(token || "");

  if (!payload || typeof payload === "string" || payload.role !== "admin") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }
  console.log(payload)

  const orderId =  (await context.params).id;
  const { assignments } = await req.json();

  if (!Array.isArray(assignments) || assignments.length === 0) {
    return NextResponse.json({ error: "Aucune affectation fournie" }, { status: 400 });
  }

  try {
    await db.transaction(async (tx) => {
      for (const entry of assignments) {
        const { item_id, inventory_id, quantity } = entry;

        // Vérifier stock disponible
        const stockCheck = await tx
          .select({ stock: inventoryItems.stock })
          .from(inventoryItems)
          .where(
            and(
              eq(inventoryItems.itemId, item_id),
              eq(inventoryItems.inventoryId, inventory_id)
            )
          );

        if (stockCheck.length === 0 || stockCheck[0].stock < quantity) {
          throw new Error(`Stock insuffisant pour l’item ${item_id} dans l’inventaire ${inventory_id}`);
        }

        // Insérer l’affectation
        await tx.insert(orderInventoryAssignments).values({
          order_id: orderId,
          item_id,
          inventory_id,
          quantity,
        });

        // Décrémenter le stock
        await tx
          .update(inventoryItems)
          .set({
            stock: sql`${inventoryItems.stock} - ${quantity}`,
          })
          .where(
            and(
              eq(inventoryItems.itemId, item_id),
              eq(inventoryItems.inventoryId, inventory_id)
            )
          );
      }

      // Mettre à jour l’état de la commande
      await tx.update(orders).set({ state: 1, processed_by:payload.userId  }).where(eq(orders.id, orderId));
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur validation order:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
