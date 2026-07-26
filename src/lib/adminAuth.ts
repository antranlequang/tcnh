import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export const SUPER_ADMIN_EMAILS = [
  "dktaichinhnganhang@st.uel.edu.vn",
  "tranlequangan2308@gmail.com",
] as const;

export type AdminRole = "admin" | "super_admin";

export type AdminIdentity = {
  email: string | null;
  role: AdminRole;
  authMethod: "password" | "google";
};

export type AdminAuthValidation = {
  ok: boolean;
  email?: string;
  fullName?: string;
  role?: AdminRole;
  authMethod?: "password" | "google";
  message?: string;
  status?: number;
};

export function isSuperAdminEmail(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.some((allowedEmail) => allowedEmail === normalizedEmail);
}

function deriveDisplayName(email: string, userMetadata: Record<string, unknown>): string {
  const metadataName = [
    userMetadata.full_name,
    userMetadata.name,
    userMetadata.display_name,
  ].find((value) => typeof value === "string" && value.trim());

  if (typeof metadataName === "string") return metadataName.trim();

  const emailName = email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return emailName
    .split(" ")
    .map((part) => part.charAt(0).toLocaleUpperCase("vi") + part.slice(1))
    .join(" ");
}

export async function validateGoogleAdminToken(accessToken: string): Promise<AdminAuthValidation> {
  if (!supabaseAdmin) {
    return {
      ok: false,
      message: "Kết nối quản trị Supabase chưa được cấu hình.",
      status: 503,
    };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  const email = data.user?.email?.trim().toLowerCase();

  if (error || !email) {
    return {
      ok: false,
      message: "Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn.",
      status: 401,
    };
  }

  if (isSuperAdminEmail(email)) {
    return {
      ok: true,
      email,
      fullName: deriveDisplayName(email, data.user?.user_metadata || {}),
      role: "super_admin",
      authMethod: "google",
    };
  }

  const { data: adminAccount, error: accountError } = await supabaseAdmin
    .from("admin_accounts")
    .select("email")
    .eq("email", email)
    .eq("role", "admin")
    .maybeSingle();

  if (accountError) {
    return {
      ok: false,
      message: `Không thể kiểm tra quyền quản trị: ${accountError.message}`,
      status: 503,
    };
  }

  if (!adminAccount) {
    return {
      ok: false,
      message: "Tài khoản Google này không có quyền truy cập trang quản trị.",
      status: 403,
    };
  }

  return {
    ok: true,
    email,
    fullName: deriveDisplayName(email, data.user?.user_metadata || {}),
    role: "admin",
    authMethod: "google",
  };
}

export async function authenticateAdminRequest(req: Request): Promise<AdminAuthValidation> {
  const expected = process.env.ADMIN_PASSWORD;
  const provided = req.headers.get("x-admin-password") || "";
  if (expected && provided === expected) {
    return {
      ok: true,
      role: "admin",
      authMethod: "password",
    };
  }

  const authorization = req.headers.get("authorization") || "";
  const bearerToken = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";
  const accessToken = bearerToken || provided;

  if (accessToken) {
    return validateGoogleAdminToken(accessToken);
  }

  return {
    ok: false,
    message: "Bạn chưa đăng nhập quản trị.",
    status: 401,
  };
}

export async function assertAdminRequest(req: Request): Promise<NextResponse | null> {
  const result = await authenticateAdminRequest(req);
  if (result.ok) return null;

  return NextResponse.json(
    { success: false, message: result.message },
    { status: result.status || 401 }
  );
}

export async function requireSuperAdmin(req: Request): Promise<
  | { identity: AdminIdentity; error: null }
  | { identity: null; error: NextResponse }
> {
  const result = await authenticateAdminRequest(req);
  if (!result.ok) {
    return {
      identity: null,
      error: NextResponse.json(
        { success: false, message: result.message },
        { status: result.status || 401 }
      ),
    };
  }

  if (result.role !== "super_admin") {
    return {
      identity: null,
      error: NextResponse.json(
        { success: false, message: "Chỉ super admin mới có quyền thực hiện thao tác này." },
        { status: 403 }
      ),
    };
  }

  return {
    identity: {
      email: result.email || null,
      role: result.role,
      authMethod: result.authMethod || "google",
    },
    error: null,
  };
}

export function validateAdminPassword(password: string): { ok: boolean; message?: string } {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return { ok: false, message: "Mật khẩu quản trị chưa được cấu hình trên máy chủ." };
  }

  if (password !== expected) {
    return { ok: false, message: "Mật khẩu quản trị không chính xác." };
  }

  return { ok: true };
}
