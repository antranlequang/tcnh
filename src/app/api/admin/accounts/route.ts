import { NextResponse } from "next/server";
import {
  SUPER_ADMIN_EMAILS,
  isSuperAdminEmail,
  requireSuperAdmin,
} from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { serializeError } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADMIN_EMAIL_DOMAIN = "@st.uel.edu.vn";

export async function GET(request: Request) {
  const { identity, error: authError } = await requireSuperAdmin(request);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, message: "Kết nối quản trị Supabase chưa được cấu hình." },
      { status: 503 }
    );
  }

  try {
    const [{ data: accounts, error: accountsError }, { data: profiles, error: profilesError }] =
      await Promise.all([
        supabaseAdmin
          .from("admin_accounts")
          .select("email, role, is_protected, created_by, created_at")
          .order("created_at", { ascending: true }),
        supabaseAdmin
          .from("admin_user_profiles")
          .select("*"),
      ]);

    if (accountsError) throw accountsError;
    if (profilesError) throw profilesError;

    const accountMap = new Map(
      (accounts || []).map((account) => [String(account.email).toLowerCase(), account])
    );
    const profileMap = new Map(
      (profiles || []).map((profile) => [String(profile.email).toLowerCase(), profile])
    );
    const allEmails = new Set([
      ...SUPER_ADMIN_EMAILS,
      ...Array.from(accountMap.keys()),
    ]);

    const data = Array.from(allEmails)
      .map((email) => {
        const account = accountMap.get(email);
        const profile = profileMap.get(email);
        const protectedAccount = isSuperAdminEmail(email);

        return {
          email,
          role: protectedAccount ? "super_admin" : "admin",
          protected: protectedAccount,
          createdBy: account?.created_by || null,
          createdAt: account?.created_at || null,
          profile: profile
            ? {
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
              }
            : null,
        };
      })
      .sort((a, b) => {
        if (a.role !== b.role) return a.role === "super_admin" ? -1 : 1;
        return a.email.localeCompare(b.email);
      });

    return NextResponse.json({
      success: true,
      data,
      currentEmail: identity.email,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: serializeError(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { identity, error: authError } = await requireSuperAdmin(request);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, message: "Kết nối quản trị Supabase chưa được cấu hình." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập một địa chỉ email hợp lệ." },
        { status: 400 }
      );
    }

    if (!email.endsWith(ADMIN_EMAIL_DOMAIN)) {
      return NextResponse.json(
        {
          success: false,
          message: `Chỉ có thể cấp quyền admin cho email có đuôi ${ADMIN_EMAIL_DOMAIN}.`,
        },
        { status: 400 }
      );
    }

    if (isSuperAdminEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Email này đã là super admin cố định." },
        { status: 409 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("admin_accounts")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email này đã có quyền quản trị." },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabaseAdmin
      .from("admin_accounts")
      .insert({
        email,
        role: "admin",
        is_protected: false,
        created_by: identity.email,
      });
    if (insertError) throw insertError;

    const { error: profileError } = await supabaseAdmin
      .from("admin_user_profiles")
      .upsert(
        {
          email,
          full_name: "",
          school_email: email.endsWith("@st.uel.edu.vn") ? email : "",
          personal_email: email.endsWith("@st.uel.edu.vn") ? "" : email,
        },
        { onConflict: "email", ignoreDuplicates: true }
      );
    if (profileError) {
      await supabaseAdmin.from("admin_accounts").delete().eq("email", email);
      throw profileError;
    }

    return NextResponse.json({ success: true, email, role: "admin" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: serializeError(error) },
      { status: 500 }
    );
  }
}
