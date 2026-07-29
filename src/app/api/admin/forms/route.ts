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

function missingClassOptionsResponse() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Danh sách lớp chưa thể lưu vì Supabase thiếu cột class_options. Hãy chạy file docs/sql/2026-07-26_add_application_form_class_options.sql trong SQL Editor.",
    },
    { status: 503 }
  );
}

function isMissingDisplayControlColumn(error: any): boolean {
  const message = String(error?.message || "").toLowerCase();
  return (
    error?.code === "PGRST204" &&
    (message.includes("is_selected") || message.includes("is_enabled")) &&
    message.includes("application_form_templates")
  );
}

function missingDisplayControlsResponse() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Supabase chưa có cột điều khiển form. Hãy chạy file docs/sql/2026-07-29_application_form_display_controls.sql trong SQL Editor.",
    },
    { status: 503 }
  );
}

async function setSelectedTemplate(id: string, isSelected: boolean) {
  if (isSelected) {
    const clearResult = await supabaseAdmin!
      .from("application_form_templates")
      .update({ is_selected: false })
      .eq("is_selected", true);
    if (clearResult.error) return clearResult.error;
  }

  const selectResult = await supabaseAdmin!
    .from("application_form_templates")
    .update({ is_selected: isSelected })
    .eq("id", id);
  return selectResult.error;
}

export async function GET(req: Request) {
  try {
    const authError = await assertAdminRequest(req);
    if (authError) return authError;

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: "Supabase admin client not configured." }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("application_form_templates")
      .select("id, name, open_at, close_at, optional_personal_questions, department_questions, is_selected, is_enabled")
      .order("created_at", { ascending: false });

    if (isMissingDisplayControlColumn(error)) return missingDisplayControlsResponse();
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (e) {
    return NextResponse.json({ success: false, message: serializeError(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authError = await assertAdminRequest(req);
    if (authError) return authError;

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: "Supabase admin client not configured." }, { status: 500 });
    }

    const body = await req.json();
    const {
      id,
      name,
      openAt,
      closeAt,
      optionalPersonalQuestions,
      departmentQuestions,
      illustrations,
      classOptions,
      isSelected,
      isEnabled,
    } = body || {};

    if (!name || !openAt || !closeAt) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    const optionalQs = Array.from({ length: 5 }).map((_, i) => String(optionalPersonalQuestions?.[i] ?? ""));
    const deptQs = normalizeDepartmentQuestions(departmentQuestions);
    const classOpts = Array.isArray(classOptions) ? (classOptions as unknown[]).map(String).filter(Boolean) : [];

    const openIso = new Date(String(openAt)).toISOString();
    const closeIso = new Date(String(closeAt)).toISOString();

    const payload = {
      id: id ? String(id) : undefined,
      name: String(name),
      open_at: openIso,
      close_at: closeIso,
      optional_personal_questions: optionalQs,
      department_questions: deptQs,
      illustrations: Array.isArray(illustrations) ? illustrations : [],
      class_options: classOpts,
      is_enabled: Boolean(isEnabled),
    };

    // Upsert by id when provided (client uses same endpoint for create/edit)
    if (id) {
      const updateData = {
        name: payload.name,
        open_at: payload.open_at,
        close_at: payload.close_at,
        optional_personal_questions: payload.optional_personal_questions,
        department_questions: payload.department_questions,
        illustrations: payload.illustrations,
        is_enabled: payload.is_enabled,
      };
      let saveResult = await supabaseAdmin
        .from("application_form_templates")
        .update({
          ...updateData,
          class_options: payload.class_options,
        })
        .eq("id", String(id))
        .select("*")
        .single();

      if (isMissingClassOptionsColumn(saveResult.error)) {
        if (payload.class_options.length > 0) return missingClassOptionsResponse();
        saveResult = await supabaseAdmin
          .from("application_form_templates")
          .update(updateData)
          .eq("id", String(id))
          .select("*")
          .single();
      }

      if (isMissingDisplayControlColumn(saveResult.error)) return missingDisplayControlsResponse();
      if (saveResult.error) throw saveResult.error;
      const selectionError = await setSelectedTemplate(String(id), Boolean(isSelected));
      if (isMissingDisplayControlColumn(selectionError)) return missingDisplayControlsResponse();
      if (selectionError) throw selectionError;
      const data = {
        ...saveResult.data,
        class_options: saveResult.data?.class_options || [],
        is_selected: Boolean(isSelected),
      };

      // Record history snapshot (fire-and-forget; never block the response)
      supabaseAdmin
        .from("application_form_template_history")
        .insert({ template_id: data.id, action: "updated", snapshot: data })
        .then(({ error: histErr }) => {
          if (histErr) console.warn("History insert failed:", histErr.message);
        });

      return NextResponse.json({ success: true, data });
    }

    const insertData = {
      name: payload.name,
      open_at: payload.open_at,
      close_at: payload.close_at,
      optional_personal_questions: payload.optional_personal_questions,
      department_questions: payload.department_questions,
      illustrations: payload.illustrations,
      is_enabled: payload.is_enabled,
      is_selected: false,
    };
    let saveResult = await supabaseAdmin
      .from("application_form_templates")
      .insert({
        ...insertData,
        class_options: payload.class_options,
      })
      .select("*")
      .single();

    if (isMissingClassOptionsColumn(saveResult.error)) {
      if (payload.class_options.length > 0) return missingClassOptionsResponse();
      saveResult = await supabaseAdmin
        .from("application_form_templates")
        .insert(insertData)
        .select("*")
        .single();
    }

    if (isMissingDisplayControlColumn(saveResult.error)) return missingDisplayControlsResponse();
    if (saveResult.error) throw saveResult.error;
    const selectionError = await setSelectedTemplate(String(saveResult.data.id), Boolean(isSelected));
    if (isMissingDisplayControlColumn(selectionError)) return missingDisplayControlsResponse();
    if (selectionError) throw selectionError;
    const data = {
      ...saveResult.data,
      class_options: saveResult.data?.class_options || [],
      is_selected: Boolean(isSelected),
    };

    // Record history snapshot (fire-and-forget; never block the response)
    supabaseAdmin
      .from("application_form_template_history")
      .insert({ template_id: data.id, action: "created", snapshot: data })
      .then(({ error: histErr }) => {
        if (histErr) console.warn("History insert failed:", histErr.message);
      });

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, message: serializeError(e) }, { status: 500 });
  }
}
