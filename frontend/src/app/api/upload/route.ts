// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const res = await imagekit.upload({
      file: buffer,
      fileName: file.name,
    });
    console.log(res)
    return NextResponse.json({ url: res.url });
  } catch (e) {
    console.error("Erreur ImageKit:", e);
    return NextResponse.json({ error: "Échec de l'upload" }, { status: 500 });
  }
}
