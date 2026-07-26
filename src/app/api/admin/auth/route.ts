import { NextResponse } from "next/server";
import { validateAdminPassword, validateGoogleAdminToken } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

async function ensureProfileFullName(email: string, suggestedName: string): Promise<string> {
  if (!supabaseAdmin) return suggestedName;

  const { data: existingProfile, error: profileReadError } = await supabaseAdmin
    .from("admin_user_profiles")
    .select("email, full_name")
    .eq("email", email)
    .maybeSingle();
  if (profileReadError) throw profileReadError;

  const storedName = String(existingProfile?.full_name || "").trim();
  if (storedName) return storedName;

  if (existingProfile) {
    const { error: updateError } = await supabaseAdmin
      .from("admin_user_profiles")
      .update({
        full_name: suggestedName,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);
    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabaseAdmin
      .from("admin_user_profiles")
      .insert({
        email,
        full_name: suggestedName,
        school_email: email.endsWith("@st.uel.edu.vn") ? email : "",
        personal_email: email.endsWith("@st.uel.edu.vn") ? "" : email,
      });
    if (insertError) throw insertError;
  }

  return suggestedName;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const accessToken = String(body?.accessToken || "");

    if (accessToken) {
      const result = await validateGoogleAdminToken(accessToken);
      if (!result.ok) {
        return NextResponse.json(
          { success: false, message: result.message },
          { status: result.status || 401 }
        );
      }

      const email = String(result.email || "").trim().toLowerCase();
      const fullName = await ensureProfileFullName(
        email,
        String(result.fullName || email.split("@")[0] || "Admin").trim()
      );

      return NextResponse.json({
        success: true,
        authMethod: "google",
        role: result.role,
        email,
        fullName,
      });
    }

    const password = String(body?.password || "");

    const result = validateAdminPassword(password);
    if (!result.ok) {
      const status = result.message?.includes("chưa được cấu hình") ? 500 : 401;
      return NextResponse.json({ success: false, message: result.message }, { status });
    }

    return NextResponse.json({
      success: true,
      authMethod: "password",
      role: "admin",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Dữ liệu đăng nhập không hợp lệ.", error: String(error) },
      { status: 400 }
    );
  }
}
