// Fichier : /api/inventories/[id]/items/[itemId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import verifyToken from "@/lib/auth";

// PATCH : Met à jour le stock d'un item dans un inventaire
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const { id: inventoryId, itemId } = await params;

  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const { stock } = await req.json();

  if (!inventoryId || !itemId) {
    return NextResponse.json({ error: "ID manquant pour modification !" }, { status: 400 });
  }

  try {
    await db
      .update(inventoryItems)
      .set({ stock })
      .where(
        and(eq(inventoryItems.inventoryId, inventoryId), eq(inventoryItems.itemId, itemId))
      );

    return NextResponse.json({ message: "Stock mis à jour" });
  } catch (err) {
    console.error("Erreur modification stock :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE : Supprime un item d’un inventaire
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const { id: inventoryId, itemId } = await params;

  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  if (!inventoryId || !itemId) {
    return NextResponse.json({ error: "ID manquant pour suppression !" }, { status: 400 });
  }

  try {
    await db
      .delete(inventoryItems)
      .where(
        and(eq(inventoryItems.inventoryId, inventoryId), eq(inventoryItems.itemId, itemId))
      );

    return NextResponse.json({ message: "Item supprimé de l'inventaire" });
  } catch (err) {
    console.error("Erreur suppression item :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
