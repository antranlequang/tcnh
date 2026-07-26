import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { serializeError } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const authError = await assertAdminRequest(request);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, message: "Supabase admin client is not configured." },
      { status: 503 }
    );
  }

  try {
    const { error } = await supabaseAdmin
      .from("home_settings")
      .select("id")
      .limit(1);

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        database: "connected",
        checkedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: serializeError(error) },
      { status: 503 }
    );
  }
}
