import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { DEPARTMENTS, type Department } from "@/lib/applicationForms";
import { assertAdminRequest } from "@/lib/adminAuth";
import { serializeError } from "@/lib/utils";

function normalizeDepartmentQuestions(input: any): Record<Department, string[]> {
  const out = {} as Record<Department, string[]>;
  for (const dept of DEPARTMENTS) {
    const arr = input?.[dept];
    const fixed = Array.from({ length: 3 }).map((_, i) => String(arr?.[i] ?? ""));
    out[dept] = fixed;
  }
  return out;
}

function isMissingClassOptionsColumn(error: any): boolean {
  const message = String(error?.message || "").toLowerCase();
  return (
    error?.code === "PGRST204" &&
    message.includes("class_options") &&
    message.includes("application_form_templates")
  );
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await assertAdminRequest(req);
    if (authError) return authError;

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: "Supabase admin client not configured." }, { status: 500 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("application_form_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, message: serializeError(e) }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await assertAdminRequest(req);
    if (authError) return authError;

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: "Supabase admin client not configured." }, { status: 500 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });

    const body = await req.json();
    const { name, openAt, closeAt, optionalPersonalQuestions, departmentQuestions, illustrations, classOptions } =
      body || {};

    if (!name || !openAt || !closeAt) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    const payload = {
      name: String(name),
      open_at: new Date(String(openAt)).toISOString(),
      close_at: new Date(String(closeAt)).toISOString(),
      optional_personal_questions: Array.from({ length: 5 }).map((_, i) => String(optionalPersonalQuestions?.[i] ?? "")),
      department_questions: normalizeDepartmentQuestions(departmentQuestions),
      illustrations: Array.isArray(illustrations) ? illustrations : [],
      class_options: Array.isArray(classOptions) ? (classOptions as unknown[]).map(String).filter(Boolean) : [],
    };

    const { class_options: classOptionsPayload, ...legacyPayload } = payload;
    let saveResult = await supabaseAdmin
      .from("application_form_templates")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (isMissingClassOptionsColumn(saveResult.error)) {
      if (classOptionsPayload.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Danh sách lớp chưa thể lưu vì Supabase thiếu cột class_options. Hãy chạy file docs/sql/2026-07-26_add_application_form_class_options.sql trong SQL Editor.",
          },
          { status: 503 }
        );
      }
      saveResult = await supabaseAdmin
        .from("application_form_templates")
        .update(legacyPayload)
        .eq("id", id)
        .select("*")
        .single();
    }

    if (saveResult.error) throw saveResult.error;
    const data = { ...saveResult.data, class_options: saveResult.data?.class_options || [] };

    // Record history snapshot (fire-and-forget; never block the response)
    supabaseAdmin
      .from("application_form_template_history")
      .insert({ template_id: data.id, action: "updated", snapshot: data })
      .then(({ error: histErr }) => {
        if (histErr) console.warn("History insert failed:", histErr.message);
      });

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, message: serializeError(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await assertAdminRequest(req);
    if (authError) return authError;

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: "Supabase admin client not configured." }, { status: 500 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });

    const { error } = await supabaseAdmin.from("application_form_templates").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true, data: { id } });
  } catch (e) {
    return NextResponse.json({ success: false, message: serializeError(e) }, { status: 500 });
  }
}
