import { db } from "@/db";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// 🔐 Fonction de vérification du token
function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1]; // Bearer <token>
  if (!token) return null;

  try {
    const v = jwt.verify(token, process.env.JWT_SECRET!)
  return ((v as any)["userId"]) as string
  } catch (err) {
    console.error("JWT invalid:", err);
    return null;
  }
}

// 🗑️ DELETE item (logique)
export async function DELETE(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const id = req.nextUrl.pathname.split("/").pop();
  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  try {
    await db.update(items)
      .set({
        deletedAt: new Date(),
        deletedBy: user  || "system", // ← identifiant de l'utilisateur
      })
      .where(eq(items.id, id));

    return NextResponse.json({ message: "Item supprimé (logiquement)" });
  } catch (e) {
    console.error("Erreur suppression:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// 📝 PUT item (modification)
export async function PUT(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const id = req.nextUrl.pathname.split("/").pop();
  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  try {
    const data = await req.json();

    await db.update(items)
      .set({
        name: data.name,
        desc: data.desc,
        metadata: data.metadata,
        updatedAt: new Date(),
        updatedBy: user || "system",
      })
      .where(eq(items.id, id));

    return NextResponse.json({ message: "Item mis à jour" });
  } catch (e) {
    console.error("Erreur modification:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
