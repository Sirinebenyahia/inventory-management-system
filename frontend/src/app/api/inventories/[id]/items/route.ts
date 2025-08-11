import { db } from "@/db";
import { inventoryItems, items } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import verifyToken from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// --- GET Handler ---
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get("authorization");
  if (authHeader === null)
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  const user = verifyToken(token);
  if (!user)
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const inventoryId = params.id;

  try {
    const data = await db
      .select({
        id: items.id,
        name: items.name,
        desc: items.desc,
        image_url: items.image_url,
        stock: inventoryItems.stock,
        threshold: inventoryItems.threshold,
      })
      .from(inventoryItems)
      .innerJoin(items, eq(items.id, inventoryItems.itemId))
      .where(
        and(
          eq(inventoryItems.inventoryId, inventoryId),
          isNull(items.deletedAt) // ✅ ignorer les items supprimés
        )
      );

    const result = data.map((item) => ({
      ...item,
      alerte: item.stock < item.threshold,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("Erreur récupération des items :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// --- POST Handler ---
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get("authorization");
  if (authHeader === null)
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  const user = verifyToken(token);
  if (user === null)
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const { id: inventoryId } = params;
  const { itemId, stock } = await req.json();

  if (!inventoryId || !itemId || typeof stock !== "number" || stock <= 0) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const existing = await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.inventoryId, inventoryId),
          eq(inventoryItems.itemId, itemId)
        )
      );

    if (existing.length > 0) {
      await db
        .update(inventoryItems)
        .set({ stock: existing[0].stock + stock })
        .where(
          and(
            eq(inventoryItems.inventoryId, inventoryId),
            eq(inventoryItems.itemId, itemId)
          )
        );
    } else {
      await db.insert(inventoryItems).values({
        inventoryId,
        itemId,
        stock,
        threshold: 10,
      });
    }

    return NextResponse.json({ message: "Stock ajouté avec succès" });
  } catch (err) {
    console.error("Erreur lors de l'ajout du stock :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
