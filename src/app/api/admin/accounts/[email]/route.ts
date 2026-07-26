import { NextResponse } from "next/server";
import { isSuperAdminEmail, requireSuperAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { serializeError } from "@/lib/utils";

const normalizeProfileValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ email: string }> }
) {
  const { identity, error: authError } = await requireSuperAdmin(request);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, message: "Kết nối quản trị Supabase chưa được cấu hình." },
      { status: 503 }
    );
  }

  try {
    const { email: rawEmail } = await context.params;
    const email = decodeURIComponent(String(rawEmail || "")).trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Thiếu email tài khoản quản trị." },
        { status: 400 }
      );
    }

    const targetIsSuperAdmin = isSuperAdminEmail(email);
    if (targetIsSuperAdmin && email !== identity.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Không thể chỉnh sửa thông tin của super admin cùng cấp.",
        },
        { status: 403 }
      );
    }

    if (!targetIsSuperAdmin) {
      const { data: account, error: accountError } = await supabaseAdmin
        .from("admin_accounts")
        .select("email")
        .eq("email", email)
        .eq("role", "admin")
        .maybeSingle();

      if (accountError) throw accountError;
      if (!account) {
        return NextResponse.json(
          { success: false, message: "Không tìm thấy tài khoản admin này." },
          { status: 404 }
        );
      }
    }

    const body = await request.json();
    const profileRecord = {
      email,
      full_name: normalizeProfileValue(body?.fullName),
      position: normalizeProfileValue(body?.position),
      unit: normalizeProfileValue(body?.unit),
      class_name: normalizeProfileValue(body?.className),
      transportation: normalizeProfileValue(body?.transportation),
      address: normalizeProfileValue(body?.address),
      school_email: normalizeProfileValue(body?.schoolEmail),
      personal_email: normalizeProfileValue(body?.personalEmail),
      phone: normalizeProfileValue(body?.phone),
      student_id: normalizeProfileValue(body?.studentId),
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("admin_user_profiles")
      .upsert(profileRecord, { onConflict: "email" })
      .select("*")
      .single();
    if (profileError) throw profileError;

    return NextResponse.json({
      success: true,
      data: {
        fullName: profile.full_name || "",
        position: profile.position || "",
        unit: profile.unit || "",
        className: profile.class_name || "",
        transportation: profile.transportation || "",
        address: profile.address || "",
        schoolEmail: profile.school_email || "",
        personalEmail: profile.personal_email || "",
        phone: profile.phone || "",
        studentId: profile.student_id || "",
        updatedAt: profile.updated_at || null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: serializeError(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ email: string }> }
) {
  const { error: authError } = await requireSuperAdmin(request);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, message: "Kết nối quản trị Supabase chưa được cấu hình." },
      { status: 503 }
    );
  }

  try {
    const { email: rawEmail } = await context.params;
    const email = decodeURIComponent(String(rawEmail || "")).trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Thiếu email tài khoản quản trị." },
        { status: 400 }
      );
    }

    if (isSuperAdminEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Không thể xóa tài khoản super admin cố định." },
        { status: 403 }
      );
    }

    const { error: accountError } = await supabaseAdmin
      .from("admin_accounts")
      .delete()
      .eq("email", email)
      .eq("role", "admin");
    if (accountError) throw accountError;

    const { error: profileError } = await supabaseAdmin
      .from("admin_user_profiles")
      .delete()
      .eq("email", email);
    if (profileError) throw profileError;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: serializeError(error) },
      { status: 500 }
    );
  }
}
