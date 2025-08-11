import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import verifyToken from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload || typeof payload === "string") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const result = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, payload.userId));

    const user = result[0];

    if (!user) {
      return new Response(JSON.stringify({ error: "Utilisateur non trouvé" }), { status: 404 });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Erreur lors de la récupération du profil :", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500 });
  }
}
