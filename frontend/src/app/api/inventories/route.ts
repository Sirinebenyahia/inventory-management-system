import { db } from "@/db";
import { inventories } from "@/db/schema";
import verifyToken from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// 🔍 GET : liste des inventaires
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const result = await db.select().from(inventories);
  return NextResponse.json(result);
}

// ✅ POST : création d'un inventaire
export async function POST(req: NextRequest) {
  const { name, location, description } = await req.json();

  if (!name || !location) {
    return NextResponse.json({ error: "Nom et emplacement requis" }, { status: 400 });
  }

  try {
    await db.insert(inventories).values({
      name,
      location,
      
      
    });

    return NextResponse.json({ message: "Inventaire créé" }, { status: 201 });
  } catch (error) {
    console.error("Erreur création inventaire:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
