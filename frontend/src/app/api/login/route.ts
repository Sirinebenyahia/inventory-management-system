import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Champs requis." }, { status: 400 });
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return NextResponse.json({ error: "Aucun compte trouvé." }, { status: 404 });
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
    }
console.log("🧪 JWT_SECRET:", process.env.JWT_SECRET);

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    console.log("✅ Token généré:", token);

 

    return NextResponse.json({ token, message: "Connexion réussie !" });
  } catch (error) {
    console.error("Erreur de connexion :", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
