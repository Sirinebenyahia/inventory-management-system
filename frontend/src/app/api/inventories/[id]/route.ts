import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventories } from "@/db/schema";
import { eq } from "drizzle-orm";

// ✅ GET /api/inventories/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventory = await db
      .select()
      .from(inventories)
      .where(eq(inventories.id, params.id));

    if (!inventory || inventory.length === 0) {
      return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
    }

    return NextResponse.json(inventory[0]);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

// ✅ PUT /api/inventories/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { name, location } = body;

  try {
    await db
      .update(inventories)
      .set({ name, location })
      .where(eq(inventories.id, params.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ✅ DELETE /api/inventories/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(inventories).where(eq(inventories.id, params.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
