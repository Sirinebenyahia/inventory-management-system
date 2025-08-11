import { db } from "@/db";
import { users } from "@/db/schema";
import verifyToken from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// --- GET ---
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id: userId } = context.params;

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload || typeof payload === "string") return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  if (payload.userId !== userId && payload.role !== "admin")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const result = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      phoneNumber: users.phoneNumber,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (result.length === 0) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  return NextResponse.json(result[0]);
}

// --- PATCH ---
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id: userId } = context.params;

  const authHeader = req.headers.get("authorization");
  if (!authHeader)
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload || typeof payload === "string")
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const { firstName, lastName, phoneNumber, role } = await req.json();

  // ✅ Empêche les users de modifier d'autres comptes
  if (payload.userId !== userId && payload.role !== "admin")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const fieldsToUpdate: any = { firstName, lastName, phoneNumber };

  // ✅ Seuls les admins peuvent modifier le rôle
  if (payload.role === "admin" && role) {
    fieldsToUpdate.role = role;
  }

  await db.update(users).set(fieldsToUpdate).where(eq(users.id, userId));
  return NextResponse.json({ success: true });
}


// --- DELETE ---
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id: userId } = context.params;

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload || typeof payload === "string") return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  if (payload.role !== "admin")
    return NextResponse.json({ error: "Seuls les admins peuvent supprimer" }, { status: 403 });

  await db.delete(users).where(eq(users.id, userId));
  return NextResponse.json(null, { status: 204 });
}
