import { NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { serializeError } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PASSWORD_PROFILE_EMAIL = "password-admin@local";

const defaultProfile = {
  fullName: "",
  position: "",
  unit: "",
  className: "",
  transportation: "",
  address: "",
  schoolEmail: "",
  personalEmail: "",
  phone: "",
  studentId: "",
};

const POSITION_TRANSLATIONS: Record<string, string> = {
  Secretary: "Bí thư",
  "Deputy Secretary": "Phó Bí thư",
  "Head of Department": "Trưởng ban",
  "Deputy Head of Department": "Phó Trưởng ban",
  "Standing Committee Member": "Ủy viên Ban Thường vụ",
  "Executive Committee Member": "Ủy viên Ban Chấp hành",
  Collaborator: "Cộng tác viên",
};

function mapProfile(row: any, accountEmail: string) {
  if (!row) return { ...defaultProfile, accountEmail, updatedAt: null };

  const storedPosition = String(row.position ?? "");

  return {
    fullName: String(row.full_name ?? defaultProfile.fullName),
    position: POSITION_TRANSLATIONS[storedPosition] || storedPosition,
    unit: String(row.unit ?? ""),
    className: String(row.class_name ?? ""),
    transportation: String(row.transportation ?? ""),
    address: String(row.address ?? ""),
    schoolEmail: String(row.school_email ?? ""),
    personalEmail: String(row.personal_email ?? ""),
    phone: String(row.phone ?? ""),
    studentId: String(row.student_id ?? ""),
    accountEmail,
    updatedAt: row?.updated_at ? String(row.updated_at) : null,
  };
}

export async function GET(request: Request) {
  const auth = await authenticateAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status || 401 }
    );
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, message: "Kết nối quản trị Supabase chưa được cấu hình." },
      { status: 503 }
    );
  }

  try {
    const accountEmail = auth.email || PASSWORD_PROFILE_EMAIL;
    const { data, error } = await supabaseAdmin
      .from("admin_user_profiles")
      .select("*")
      .eq("email", accountEmail)
      .maybeSingle();
    if (error) throw error;

    return NextResponse.json({ success: true, data: mapProfile(data, accountEmail) });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: serializeError(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const auth = await authenticateAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status || 401 }
    );
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, message: "Kết nối quản trị Supabase chưa được cấu hình." },
      { status: 503 }
    );
  }

  try {
    const accountEmail = auth.email || PASSWORD_PROFILE_EMAIL;
    const body = await request.json();
    const fullName = String(body?.fullName || "").trim();
    if (!fullName) {
      return NextResponse.json(
        { success: false, message: "Họ và tên không được để trống." },
        { status: 400 }
      );
    }

    const payload = {
      email: accountEmail,
      full_name: fullName,
      position: String(body?.position || "").trim(),
      unit: String(body?.unit || "").trim(),
      class_name: String(body?.className || "").trim(),
      transportation: String(body?.transportation || "").trim(),
      address: String(body?.address || "").trim(),
      school_email: String(body?.schoolEmail || "").trim(),
      personal_email: String(body?.personalEmail || "").trim(),
      phone: String(body?.phone || "").trim(),
      student_id: String(body?.studentId || "").trim(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("admin_user_profiles")
      .upsert(payload, { onConflict: "email" })
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data: mapProfile(data, accountEmail) });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: serializeError(error) },
      { status: 500 }
    );
  }
}
