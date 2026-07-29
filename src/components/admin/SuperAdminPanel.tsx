"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Car,
  CheckCircle2,
  GraduationCap,
  IdCard,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ManagedProfile = {
  fullName: string;
  position: string;
  unit: string;
  className: string;
  transportation: string;
  address: string;
  schoolEmail: string;
  personalEmail: string;
  phone: string;
  studentId: string;
  updatedAt: string | null;
};

type ManagedAdmin = {
  email: string;
  role: "admin" | "super_admin";
  protected: boolean;
  createdBy: string | null;
  createdAt: string | null;
  profile: ManagedProfile | null;
};

type SortOption = "name-asc" | "email-asc" | "newest" | "oldest";

const EMPTY_PROFILE: ManagedProfile = {
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
  updatedAt: null,
};

const PROFILE_FIELDS: Array<{
  key: Exclude<keyof ManagedProfile, "updatedAt">;
  label: string;
  placeholder: string;
  icon: typeof UserRound;
  wide?: boolean;
  multiline?: boolean;
}> = [
  { key: "fullName", label: "Họ và tên", placeholder: "Nhập họ và tên", icon: UserRound },
  { key: "position", label: "Chức vụ", placeholder: "Nhập chức vụ", icon: IdCard },
  { key: "unit", label: "Ban/Đơn vị", placeholder: "Nhập ban hoặc đơn vị", icon: Building2 },
  { key: "className", label: "Lớp", placeholder: "Nhập lớp", icon: GraduationCap },
  {
    key: "transportation",
    label: "Phương tiện di chuyển",
    placeholder: "Nhập phương tiện",
    icon: Car,
  },
  { key: "studentId", label: "Mã số sinh viên", placeholder: "Nhập MSSV", icon: IdCard },
  { key: "schoolEmail", label: "Email trường", placeholder: "Nhập email trường", icon: Mail },
  { key: "personalEmail", label: "Email cá nhân", placeholder: "Nhập email cá nhân", icon: Mail },
  { key: "phone", label: "Số điện thoại", placeholder: "Nhập số điện thoại", icon: Phone },
  {
    key: "address",
    label: "Địa chỉ",
    placeholder: "Nhập địa chỉ",
    icon: MapPin,
    wide: true,
    multiline: true,
  },
];

const formatDate = (value: string | null) => {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const initials = (account: ManagedAdmin) => {
  const name = account.profile?.fullName.trim();
  if (!name) return account.email.slice(0, 2).toUpperCase();
  return name
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

export function SuperAdminPanel({
  authHeaders,
}: {
  authHeaders: Record<string, string>;
}) {
  const [accounts, setAccounts] = useState<ManagedAdmin[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [profileDraft, setProfileDraft] = useState<ManagedProfile>(EMPTY_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.email === selectedEmail) || accounts[0] || null,
    [accounts, selectedEmail]
  );

  const canEditSelected = Boolean(
    selectedAccount &&
      (!selectedAccount.protected || selectedAccount.email === currentEmail)
  );

  const visibleAccounts = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("vi");
    const filtered = accounts.filter((account) => {
      if (!query) return true;
      return [account.email, account.profile?.fullName, account.profile?.unit, account.profile?.position]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("vi").includes(query));
    });

    return [...filtered].sort((left, right) => {
      if (sortBy === "email-asc") return left.email.localeCompare(right.email, "vi");
      if (sortBy === "newest") {
        return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime();
      }
      const leftName = left.profile?.fullName || left.email;
      const rightName = right.profile?.fullName || right.email;
      return leftName.localeCompare(rightName, "vi");
    });
  }, [accounts, searchTerm, sortBy]);

  const accountGroups = useMemo(
    () => [
      {
        key: "super_admin",
        title: "Super Admin",
        description: "Toàn quyền",
        accounts: visibleAccounts.filter((account) => account.role === "super_admin"),
      },
      {
        key: "admin",
        title: "Admin",
        description: "Quản trị nội dung website",
        accounts: visibleAccounts.filter((account) => account.role === "admin"),
      },
    ],
    [visibleAccounts]
  );

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/accounts", {
        headers: authHeaders,
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Không thể tải danh sách quản trị viên.");
      }

      const nextAccounts: ManagedAdmin[] = Array.isArray(payload?.data) ? payload.data : [];
      setAccounts(nextAccounts);
      setCurrentEmail(String(payload?.currentEmail || "").toLowerCase());
      setSelectedEmail((current) => {
        if (nextAccounts.some((account) => account.email === current)) return current;
        return nextAccounts[0]?.email || "";
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    setProfileDraft(selectedAccount?.profile || EMPTY_PROFILE);
    setIsEditing(false);
  }, [selectedAccount]);

  const addAdmin = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Không thể thêm quản trị viên.");
      }

      const normalizedEmail = String(payload.email || newEmail).trim().toLowerCase();
      setNewEmail("");
      setSuccess(`Đã cấp quyền admin cho ${normalizedEmail}.`);
      await loadAccounts();
      setSelectedEmail(normalizedEmail);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedAccount || !canEditSelected) return;

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(
        `/api/admin/accounts/${encodeURIComponent(selectedAccount.email)}`,
        {
          method: "PATCH",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(profileDraft),
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Không thể cập nhật hồ sơ.");
      }

      setAccounts((current) =>
        current.map((account) =>
          account.email === selectedAccount.email
            ? { ...account, profile: payload.data }
            : account
        )
      );
      setProfileDraft(payload.data);
      setIsEditing(false);
      setSuccess(`Đã cập nhật hồ sơ của ${selectedAccount.email}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setSaving(false);
    }
  };

  const deleteAdmin = async (account: ManagedAdmin) => {
    if (account.protected) return;
    if (!window.confirm(`Thu hồi quyền admin của ${account.email}?`)) return;

    setDeletingEmail(account.email);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/admin/accounts/${encodeURIComponent(account.email)}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Không thể xóa quản trị viên.");
      }

      setSuccess(`Đã thu hồi quyền admin của ${account.email}.`);
      await loadAccounts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    } finally {
      setDeletingEmail("");
    }
  };

  const regularAdminCount = accounts.filter((account) => account.role === "admin").length;
  const superAdminCount = accounts.filter((account) => account.role === "super_admin").length;

  return (
    <main className="min-w-0 flex-1 bg-[#f4f7fb]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 md:py-10">
        <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="mt-2 font-headline text-3xl font-semibold tracking-[-0.03em] text-[#0b1f33]">
              Quản lý tài khoản
            </h1>

          </div>

          <form
            onSubmit={addAdmin}
            className="flex w-full max-w-2xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row"
          >
            <Input
              type="email"
              required
              pattern="^[^@\s]+@st\.uel\.edu\.vn$"
              title="Email phải có đuôi @st.uel.edu.vn"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder="example@st.uel.edu.vn"
              aria-label="Email admin mới"
              className="h-11 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 shrink-0 rounded-xl bg-[#0b4f8a] px-5 text-white hover:bg-[#073e70]"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Thêm admin
            </Button>
          </form>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-5">
          {[
            { label: "Tổng tài khoản", value: accounts.length, icon: UsersRound, color: "text-[#0b4f8a]" },
            { label: "Super Admin", value: superAdminCount, icon: ShieldCheck, color: "text-[#F05A23]" },
            { label: "Admin", value: regularAdminCount, icon: UserRound, color: "text-emerald-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`grid h-11 w-11 place-items-center rounded-xl bg-slate-50 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0b1f33]">{value}</p>
                <p className="text-xs font-medium text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p role="alert" className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </p>
        )}

        <div className="grid gap-5 xl:grid-cols-[410px_minmax(0,1fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-[#0b1f33]">Danh sách tài khoản</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Hiển thị {visibleAccounts.length}/{accounts.length} tài khoản
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void loadAccounts()}
                  disabled={loading}
                  aria-label="Tải lại danh sách"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm theo tên, email, đơn vị…"
                  className="h-10 rounded-xl border-slate-200 pl-9"
                />
              </div>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                aria-label="Sắp xếp danh sách tài khoản"
                className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#0b4f8a] focus:ring-2 focus:ring-blue-100"
              >
                <option value="name-asc">Sắp xếp: Tên A–Z</option>
                <option value="email-asc">Sắp xếp: Email A–Z</option>
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="oldest">Sắp xếp: Cũ nhất</option>
              </select>
            </div>

            <div className="max-h-[720px] overflow-y-auto p-3">
              {loading && accounts.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải danh sách…
                </div>
              ) : visibleAccounts.length === 0 ? (
                <div className="py-14 text-center text-sm text-slate-400">
                  Không tìm thấy tài khoản phù hợp.
                </div>
              ) : (
                accountGroups.map((group) =>
                  group.accounts.length > 0 ? (
                    <div key={group.key} className="mb-5 last:mb-0">
                      <div className="mb-2 flex items-center justify-between px-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                            {group.title}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                          {group.accounts.length}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {group.accounts.map((account) => {
                          const active = selectedAccount?.email === account.email;
                          const isCurrent = account.email === currentEmail;
                          return (
                            <button
                              key={account.email}
                              type="button"
                              onClick={() => setSelectedEmail(account.email)}
                              className={`w-full rounded-xl border p-3 text-left transition-all ${
                                active
                                  ? "border-blue-200 bg-[#edf5fc] shadow-sm"
                                  : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xs font-bold text-white ${
                                    account.protected ? "bg-[#F05A23]" : "bg-[#0b3767]"
                                  }`}
                                >
                                  {initials(account)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-bold text-slate-800">
                                      {account.profile?.fullName || "Chưa cập nhật hồ sơ"}
                                    </p>
                                    {isCurrent && (
                                      <span className="shrink-0 text-[10px] font-bold text-[#0b4f8a]">
                                        Bạn
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-0.5 truncate text-xs text-slate-400">{account.email}</p>
                                  <p className="mt-1 truncate text-[11px] text-slate-500">
                                    {account.profile?.position || account.profile?.unit || "Chưa có chức vụ"}
                                  </p>
                                </div>
                                {account.protected && (
                                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#F05A23]" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null
                )
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {selectedAccount ? (
              <>
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white ${
                        selectedAccount.protected ? "bg-[#F05A23]" : "bg-[#0b3767]"
                      }`}
                    >
                      {initials(selectedAccount)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-lg font-bold text-[#0b1f33]">
                          {selectedAccount.profile?.fullName || "Chưa cập nhật hồ sơ"}
                        </h2>
                        <Badge
                          variant="outline"
                          className={
                            selectedAccount.protected
                              ? "border-orange-200 bg-orange-50 text-orange-700"
                              : "border-blue-200 bg-blue-50 text-blue-700"
                          }
                        >
                          {selectedAccount.protected ? "Super Admin" : "Admin"}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-500">{selectedAccount.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {canEditSelected && !isEditing && (
                      <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="rounded-xl bg-[#0b4f8a] text-white hover:bg-[#073e70]"
                      >
                        <Pencil className="h-4 w-4" />
                        Chỉnh sửa hồ sơ
                      </Button>
                    )}
                    {!selectedAccount.protected && !isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void deleteAdmin(selectedAccount)}
                        disabled={deletingEmail === selectedAccount.email}
                        className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        {deletingEmail === selectedAccount.email ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Thu hồi quyền
                      </Button>
                    )}
                  </div>
                </div>

                {selectedAccount.protected && selectedAccount.email !== currentEmail && (
                  <div className="mx-5 mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 sm:mx-6">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-bold">Chế độ chỉ xem</p>
                    </div>
                  </div>
                )}

                {isEditing && canEditSelected ? (
                  <form onSubmit={saveProfile} className="p-5 sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-[#0b1f33]">Chỉnh sửa thông tin cá nhân</h3>
                        <p className="mt-1 text-xs text-slate-400">
                          Email đăng nhập và cấp quyền không thể thay đổi tại đây.
                        </p>
                      </div>
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        {selectedAccount.email === currentEmail ? "Hồ sơ của bạn" : "Hồ sơ admin"}
                      </Badge>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {PROFILE_FIELDS.map(({ key, label, placeholder, icon: Icon, wide, multiline }) => (
                        <label key={key} className={wide ? "sm:col-span-2" : undefined}>
                          <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Icon className="h-3.5 w-3.5 text-slate-400" />
                            {label}
                          </span>
                          {multiline ? (
                            <Textarea
                              value={profileDraft[key]}
                              onChange={(event) =>
                                setProfileDraft((current) => ({ ...current, [key]: event.target.value }))
                              }
                              placeholder={placeholder}
                              rows={3}
                              className="resize-none rounded-xl border-slate-200"
                            />
                          ) : (
                            <Input
                              value={profileDraft[key]}
                              onChange={(event) =>
                                setProfileDraft((current) => ({ ...current, [key]: event.target.value }))
                              }
                              placeholder={placeholder}
                              type={key === "schoolEmail" || key === "personalEmail" ? "email" : "text"}
                              className="h-11 rounded-xl border-slate-200"
                            />
                          )}
                        </label>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={saving}
                        onClick={() => {
                          setProfileDraft(selectedAccount.profile || EMPTY_PROFILE);
                          setIsEditing(false);
                        }}
                        className="rounded-xl"
                      >
                        <X className="h-4 w-4" />
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-[#0b4f8a] text-white hover:bg-[#073e70]"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Lưu thay đổi
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-5 sm:p-6">
                    <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                      {PROFILE_FIELDS.map(({ key, label, icon: Icon, wide }) => (
                        <div key={key} className={wide ? "sm:col-span-2" : undefined}>
                          <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Icon className="h-3.5 w-3.5 text-slate-400" />
                            {label}
                          </p>
                          <p className="mt-2 min-h-5 whitespace-pre-wrap break-words text-sm text-slate-800">
                            {selectedAccount.profile?.[key] || "Chưa cập nhật"}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-7 grid gap-3 border-t border-slate-100 pt-5 text-xs text-slate-400 sm:grid-cols-2">
                      <p>
                        Ngày cấp quyền:{" "}
                        <span className="font-medium text-slate-600">
                          {selectedAccount.protected ? "Tài khoản hệ thống" : formatDate(selectedAccount.createdAt)}
                        </span>
                      </p>
                      <p className="sm:text-right">
                        Cập nhật hồ sơ:{" "}
                        <span className="font-medium text-slate-600">
                          {formatDate(selectedAccount.profile?.updatedAt || null)}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="grid min-h-[520px] place-items-center px-6 text-center">
                <div>
                  <UserRound className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    Chưa có tài khoản quản trị
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
