import { NextRequest, NextResponse } from "next/server";
import { reorderHeroSlidesAction } from "@/lib/actions/admin/hero-slides";
import { isValidUUID } from "@/lib/utils/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid payload, array of IDs required" }, { status: 400 });
    }
    if (!ids.every((id: unknown) => typeof id === "string" && isValidUUID(id))) {
      return NextResponse.json({ error: "Invalid slide IDs in payload" }, { status: 400 });
    }

    const result = await reorderHeroSlidesAction(ids);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to reorder slides" }, { status: 500 });
  }
}
