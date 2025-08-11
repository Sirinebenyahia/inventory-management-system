import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import verifyToken from "@/lib/auth";

// 🚀 POST: Créer un nouvel utilisateur
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.email || !body.password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    await db.insert(users).values({
      email: body.email,
      password: hashedPassword,
      username: body.username || "",
      firstName: body.firstName,
      lastName: body.lastName,
    });

    return new Response(JSON.stringify({ success: true }), { status: 201 });

  } catch (err) {
    console.error("Erreur POST /users:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// 🚀 GET: Lister tous les utilisateurs OU chercher par email
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const decoded = verifyToken(token || "");

    if (!decoded || typeof decoded === "string") {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    // 🔍 Si query param "email" => retour utilisateur spécifique
    if (email) {
      const result = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
          role: users.role,
        })
        .from(users)
        .where(eq(users.email, email));

      return new Response(JSON.stringify(result[0]), { status: 200 });
    }

    // 🔁 Sinon, retourne tous les utilisateurs
    const result = await db
      .select()
      .from(users);

    return new Response(JSON.stringify(result), { status: 200 });

  } catch (err) {
    console.error("Erreur GET /users:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
