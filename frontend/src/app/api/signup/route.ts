// src/app/api/signup/route.ts

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { username, email, password } = await request.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }

  try {
    // Vérifier séparément email et username
    const [emailExists] = await db.select({ email: users.email }).from(users).where(eq(users.email, email));
    const [usernameExists] = await db.select({ username: users.username }).from(users).where(eq(users.username, username));

    console.log("Données reçues :", { username, email, password });


    if (emailExists && usernameExists) {
      return NextResponse.json({ error: "Email et nom d'utilisateur déjà utilisés." }, { status: 400 });
    } else if (emailExists) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
    } else if (usernameExists) {
      return NextResponse.json({ error: "Ce nom d'utilisateur est déjà pris." }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "Utilisateur créé avec succès !" }, { status: 201 });
  } catch (error: any) {
    console.error("Erreur lors de la création :", error);

    if (error.code === "23505") {
      return NextResponse.json({ error: "Contrainte d’unicité violée." }, { status: 400 });
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
