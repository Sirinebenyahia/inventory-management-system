import { db } from "@/db";
import { items } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// ✅ Fonction pour vérifier le token JWT
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

// ✅ GET tous les items visibles (non supprimés)
export async function GET(req: NextRequest) {


  const user = verifyToken(req);
  if (user === null) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const result = await db.select().from(items).where(isNull(items.deletedAt));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// ✅ POST un nouvel item avec createdBy = ID de l'utilisateur connecté
export async function POST(req: NextRequest) {
  
  const user = verifyToken(req);
  if (user === null)
 {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, desc, metadata, image_url } = body;
    console.log("post", body)

    await db.insert(items).values({
      name,
      desc,
      metadata,
      image_url: image_url,

      createdBy: user, 
      // Utilise l'ID de l'utilisateur connecté
    });

    return NextResponse.json({ message: "Item créé avec succès" });
  } catch (error) {
    console.error("Erreur POST item:", error);
    return NextResponse.json({ error: "Erreur lors de la création." }, { status: 500 });
  }
}
