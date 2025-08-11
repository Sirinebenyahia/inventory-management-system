import verifyToken from "../../../lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization"); // Ex: "Bearer eyJ..."
  const token = authHeader?.split(" ")[1]; // Récupérer la partie après "Bearer"

  if (!token) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const decoded = verifyToken(token);

  if (decoded === null) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  return NextResponse.json({
    message: "Accès autorisé",
    user: decoded,
  });
};
