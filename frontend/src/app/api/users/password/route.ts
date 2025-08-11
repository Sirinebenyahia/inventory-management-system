import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import verifyToken  from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const payload = verifyToken(token || "");

  if (!payload || typeof payload === "string") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { newPassword } = await req.json();
  const hashed = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ password: hashed })
    .where(eq(users.id, payload.userId));

  return new Response(JSON.stringify({ success: true }));
}
