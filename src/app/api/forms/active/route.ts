import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { serializeError } from "@/lib/utils";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: "Supabase admin client not configured." },
        { status: 500 }
      );
    }

    const nowIso = new Date().toISOString();
    const { data: template, error } = await supabaseAdmin
      .from("application_form_templates")
      .select("*")
      .eq("is_selected", true)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    if (!template) {
      return NextResponse.json({
        success: true,
        status: "closed",
        now: nowIso,
        template: null,
      });
    }

    if (!template.is_enabled || nowIso > template.close_at) {
      return NextResponse.json({
        success: true,
        status: "closed",
        now: nowIso,
        template,
      });
    }

    if (nowIso < template.open_at) {
      return NextResponse.json({
        success: true,
        status: "not_started",
        now: nowIso,
        template,
      });
    }

    return NextResponse.json({
      success: true,
      status: "active",
      now: nowIso,
      template,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: serializeError(error) },
      { status: 500 }
    );
  }
}
