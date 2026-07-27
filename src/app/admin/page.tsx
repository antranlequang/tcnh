// ─────────────────────────────────────────────────────────────────────────────
// Admin Page — redesigned with Overview / Function / Category structure
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApplicationFormsAdmin } from '@/components/admin/ApplicationFormsAdmin';
import { AchievementsAdmin } from '@/components/admin/AchievementsAdmin';
import { ActivitiesAdmin } from '@/components/admin/ActivitiesAdmin';
import { YouthAdmin } from '@/components/admin/YouthAdmin';
import { PartnersAdmin } from '@/components/admin/PartnersAdmin';
import { StructureAdmin } from '@/components/admin/StructureAdmin';
import { BlogTestimonialsAdmin } from '@/components/admin/BlogTestimonialsAdmin';
import { BlogDiscussionAdmin } from '@/components/admin/BlogDiscussionAdmin';
import { SchoolMapAdmin } from '@/components/admin/SchoolMapAdmin';
import { SuperAdminPanel } from '@/components/admin/SuperAdminPanel';
import { formatDateTime } from '@/lib/utils';
import { DEPARTMENTS } from '@/lib/applicationForms';
import { supabase } from '@/lib/supabaseClient';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import {
  LayoutDashboard, Wrench, FolderOpen, Home, Trophy, Activity, FileText,
  ChevronDown, ChevronRight, ExternalLink, CheckCircle2, Loader2,
  Database, Bot, ShieldCheck, GraduationCap,
  LogOut, Eye, ClipboardList, Users, MessageSquare, Quote, Menu, X, Upload, MapPinned,
  RefreshCw, Sparkles, ArrowUpRight, CircleDot,
  UserRound, Pencil, Save, LockKeyhole, Mail, Phone, Building2, IdCard,
  Car, MapPin,
} from 'lucide-react';


// ── Types ─────────────────────────────────────────────────────────────────────

interface VisitMetrics { visits: number; lastUpdated: string; }
interface SiteConfig {
  frontendUrl: string;
  showAdminLink: boolean;
  adminLinkLabel: string;
}

interface FormSubmission {
  id: string;
  template_id: string;
  submitted_at: string;
  full_name: string;
  birth_date?: string;
  class_name?: string;
  student_id?: string;
  email?: string;
  phone_number?: string;
  facebook_url?: string;
  hometown?: string;
  gender?: string;
  department: string;
  photo_url: string;
  optional_personal_answers: string[];
  dept_optional_answers: string[];
  status?: string;
  standing_committee_comment?: string;
  board_comment?: string;
  team_leader_comment?: string;
}

const CANDIDATE_STATUS = {
  not_selected: { label: 'Chưa chọn',   circleColor: 'bg-gray-400',   textColor: 'text-gray-500',   btnActive: 'border-gray-400 bg-gray-50 ring-gray-300'   },
  accepted:     { label: 'Đồng ý',         circleColor: 'bg-green-500',  textColor: 'text-green-600',  btnActive: 'border-green-400 bg-green-50 ring-green-300'  },
  undecided:    { label: 'Xem xét', circleColor: 'bg-yellow-400', textColor: 'text-yellow-600', btnActive: 'border-yellow-400 bg-yellow-50 ring-yellow-300' },
  rejected:     { label: 'Loại',         circleColor: 'bg-red-500',    textColor: 'text-red-600',    btnActive: 'border-red-400 bg-red-50 ring-red-300'     },
} as const;
type CandidateStatus = keyof typeof CANDIDATE_STATUS;

const STATUS_PIE_COLORS: Record<CandidateStatus, string> = {
  not_selected: '#9ca3af',
  accepted:     '#22c55e',
  undecided:    '#f59e0b',
  rejected:     '#ef4444',
};
const DEPT_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];
const BAR_PALETTE = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];
const GENDER_PIE_COLORS = ['#3b82f6', '#ec4899', '#a78bfa', '#9ca3af', '#f97316'];

interface FormTemplateSummary {
  id: string;
  name: string;
  open_at: string;
  close_at: string;
  optional_personal_questions?: string[];
  department_questions?: Record<string, string[]>;
  class_options?: string[];
}

type AdminTab =
  | 'overview'
  | 'function'
  | 'schema'
  | 'category-home'
  | 'category-structure'
  | 'category-achievements'
  | 'category-activities'
  | 'category-youth-activities'
  | 'category-youth-student-info'
  | 'category-youth-school-map'
  | 'category-apply'
  | 'category-partners'
  | 'category-forum'
  | 'category-blog-testimonials'
  | 'category-blog-discussions';

const ADMIN_TAB_META: Record<AdminTab, { eyebrow: string; title: string; description: string }> = {
  overview: {
    eyebrow: 'Trung tâm điều hành',
    title: 'Tổng quan',
    description: 'Ghi chú: Đây là trang tổng quan, hiển thị các thông tin về đơn đăng ký và các số liệu thống kê cơ bản. Các chức năng quản trị khác có thể được truy cập thông qua menu bên trái.',
  },
  function: {
    eyebrow: 'Hệ thống',
    title: 'Kiểm thử kết nối',
    description: 'Kiểm tra nhanh tình trạng các dịch vụ đang vận hành.',
  },
  schema: {
    eyebrow: 'Hệ thống',
    title: 'Schema Visualizer',
    description: 'Quan sát cấu trúc dữ liệu và các mối quan hệ.',
  },
  'category-home': { eyebrow: 'Nội dung', title: 'Trang chủ', description: 'Quản lý nội dung hiển thị trên trang chủ.' },
  'category-structure': { eyebrow: 'Nội dung', title: 'Cơ cấu', description: 'Cập nhật các ban và thành viên trong cơ cấu.' },
  'category-achievements': { eyebrow: 'Nội dung', title: 'Thành tích', description: 'Ghi nhận và quản lý các dấu mốc nổi bật.' },
  'category-activities': { eyebrow: 'Nội dung', title: 'Hoạt động', description: 'Đăng tải và cập nhật các chương trình hoạt động.' },
  'category-youth-activities': { eyebrow: 'Tuổi trẻ', title: 'Hoạt động', description: 'Tạo nội dung mới cho chuyên mục Tuổi trẻ.' },
  'category-youth-student-info': { eyebrow: 'Tuổi trẻ', title: 'Thông tin sinh viên', description: 'Tra cứu các tiện ích và thông tin dành cho sinh viên.' },
  'category-youth-school-map': { eyebrow: 'Tuổi trẻ', title: 'School Map', description: 'Quản lý điểm đến và dữ liệu bản đồ trường.' },
  'category-apply': { eyebrow: 'Tuyển thành viên', title: 'Đơn đăng ký', description: 'Tạo biểu mẫu và quản lý hồ sơ ứng viên.' },
  'category-partners': { eyebrow: 'Nội dung', title: 'Đơn vị hợp tác', description: 'Quản lý danh sách đối tác và đơn vị đồng hành.' },
  'category-forum': { eyebrow: 'Cộng đồng', title: 'Diễn đàn', description: 'Duyệt lời gửi gắm và theo dõi các cuộc thảo luận.' },
  'category-blog-testimonials': { eyebrow: 'Diễn đàn', title: 'Lời gửi gắm', description: 'Kiểm duyệt những lời nhắn từ cộng đồng.' },
  'category-blog-discussions': { eyebrow: 'Diễn đàn', title: 'Thảo luận', description: 'Theo dõi và quản lý nội dung trao đổi.' },
};

type ServiceStatus = 'idle' | 'loading' | 'ok' | 'error';
type AdminRole = 'admin' | 'super_admin';
type AdminSection = 'general' | 'profile';

interface AdminProfile {
  accountEmail?: string;
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
}

const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  fullName: '',
  position: '',
  unit: '',
  className: '',
  transportation: '',
  address: '',
  schoolEmail: '',
  personalEmail: '',
  phone: '',
  studentId: '',
};

const ADMIN_POSITION_OPTIONS = [
  'Bí thư',
  'Phó Bí thư',
  'Trưởng ban',
  'Phó Trưởng ban',
  'Ủy viên Ban Thường vụ',
  'Ủy viên Ban Chấp hành',
  'Cộng tác viên',
] as const;

const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  submit_index: 60,
  full_name: 150,
  class_name: 120,
  department: 130,
  status: 130,
  student_id: 120,
  email: 180,
  birth_date: 120,
  gender: 100,
  submitted_at: 170,
  details: 96,
};

// ── Resizable Table Header Cell ───────────────────────────────────────────────

interface ResizableHeaderCell {
  column: string;
  label: string;
  width: number;
  onResize: (delta: number) => void;
  onSort?: () => void;
  isSorted?: boolean;
  sortOrder?: 'asc' | 'desc';
  className?: string;
}

function ResizableTableHeaderCell({ column, label, width, onResize, onSort, isSorted, sortOrder, className }: ResizableHeaderCell) {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      onResize(delta);
      setStartX(e.clientX);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startX, onResize]);

  return (
    <TableHead
      data-column={column}
      style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
      className={`relative whitespace-nowrap border-b border-blue-700 bg-gradient-to-b from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all ${className ?? ''}`}
    >
      <div className="flex h-full items-center px-2 pr-4">
        <button
          type="button"
          onClick={onSort}
          disabled={!onSort}
          className={`min-w-0 flex-1 truncate whitespace-nowrap py-2 text-center text-xs font-semibold uppercase tracking-wider transition-colors ${
            onSort ? 'hover:text-blue-100' : 'cursor-default'
          }`}
        >
          {label} {isSorted ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
        </button>
        <div
          onMouseDown={handleMouseDown}
          className={`absolute right-0 top-0 h-full w-2 bg-white/60 opacity-0 hover:opacity-100 cursor-col-resize transition-opacity ${
            isResizing ? 'opacity-100' : ''
          }`}
        />
      </div>
    </TableHead>
  );
}

// ── Sidebar button ─────────────────────────────────────────────────────────────

function SidebarBtn({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${
        active
          ? 'bg-white text-[#0b3767] font-bold shadow-[0_8px_24px_rgba(0,0,0,0.16)]'
          : 'text-white/65 hover:bg-white/[0.08] hover:text-white'
      }`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${
        active ? 'bg-[#F05A23] text-white' : 'bg-white/[0.07] text-white/70 group-hover:bg-white/10 group-hover:text-white'
      }`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {active && <span className="h-1.5 w-1.5 rounded-full bg-[#F05A23]" />}
    </button>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ServiceStatus }) {
  if (status === 'idle')
    return <Badge variant="outline" className="text-xs">Chưa kiểm tra</Badge>;
  if (status === 'loading')
    return <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">Đang kiểm tra…</Badge>;
  if (status === 'ok')
    return <Badge className="text-xs bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">Successful</Badge>;
  return <Badge className="text-xs bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">Unsuccessful</Badge>;
}

function AdminWorkspaceHeader({
  section,
  showPersonalProfile,
  onSectionChange,
  onLogout,
}: {
  section: AdminSection;
  showPersonalProfile: boolean;
  onSectionChange: (section: AdminSection) => void;
  onLogout: () => void;
}) {
  const items: Array<{ id: AdminSection; label: string; icon: LucideIcon }> = [
    { id: 'general', label: 'Chung', icon: LayoutDashboard },
    ...(showPersonalProfile
      ? [{ id: 'profile' as const, label: 'Hồ sơ cá nhân', icon: UserRound }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 h-[112px] shrink-0 bg-white text-[#144E8C] shadow-[0_4px_24px_rgba(11,31,51,0.08)] sm:h-[60px] xl:h-[104px]">
      <div className="relative mx-auto h-full max-w-[1600px] px-4 sm:px-6 xl:px-8">
        <button
          type="button"
          onClick={() => onSectionChange('general')}
          className="absolute left-4 top-3 flex h-10 items-center sm:inset-y-0 sm:top-auto xl:left-8 xl:h-auto"
          aria-label="Mở trang quản trị tổng quan"
        >
          <img src="/images/logo.png" alt="" className="h-9 w-[138px] object-contain xl:h-14 xl:w-[168px]" />
          <span className="ml-4 hidden border-l border-[#144E8C]/15 pl-4 leading-none xl:block">
            <span className="block whitespace-nowrap text-xs font-bold uppercase tracking-[0.14em]">Đoàn Khoa</span>
            <span className="mt-1.5 block whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.08em] text-[#144E8C]/60">
              Không gian quản trị
            </span>
          </span>
        </button>

        <div className="absolute left-[380px] right-[calc((100vw-100%)/-2)] top-0 hidden h-10 items-center justify-end rounded-bl-[3.5rem] bg-[#144E8C] px-8 text-white xl:flex">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
            Đi đâu cũng được, miễn là đi cùng nhau!
          </span>
          <span className="ml-5 h-1.5 w-1.5 rounded-full bg-[#F05A23]" />
        </div>

        <nav
          className="absolute inset-x-4 bottom-0 flex h-14 items-center justify-center gap-1 border-t border-slate-100 sm:inset-y-0 sm:left-auto sm:right-14 sm:h-auto sm:border-0 xl:bottom-0 xl:right-20 xl:top-auto xl:h-16"
          aria-label="Các khu vực quản trị"
        >
          {items.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSectionChange(id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-full items-center gap-2 px-3 text-xs font-bold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:bg-[#F05A23] after:transition-transform sm:px-4 sm:text-sm xl:after:bottom-3 ${
                  active
                    ? 'text-[#144E8C] after:scale-x-100'
                    : 'text-[#144E8C]/50 after:scale-x-0 hover:text-[#144E8C] hover:after:scale-x-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="absolute right-4 top-3 grid h-10 w-10 place-items-center rounded-full border border-[#144E8C]/15 text-[#144E8C] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:inset-y-0 sm:my-auto xl:right-8 xl:bottom-3 xl:top-auto"
          aria-label="Đăng xuất"
          title="Đăng xuất"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

function PersonalProfilePanel({ authHeaders }: { authHeaders: Record<string, string> }) {
  const [profile, setProfile] = useState<AdminProfile>(DEFAULT_ADMIN_PROFILE);
  const [draft, setDraft] = useState<AdminProfile>(DEFAULT_ADMIN_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch('/api/admin/profile', { headers: authHeaders, cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.message || 'Không tải được hồ sơ cá nhân.');
        if (!mounted || !payload?.data) return;
        setProfile(payload.data);
        setDraft(payload.data);
      })
      .catch((error) => {
        if (mounted) setProfileError(error instanceof Error ? error.message : String(error));
      })
      .finally(() => {
        if (mounted) setLoadingProfile(false);
      });

    return () => {
      mounted = false;
    };
  }, [authHeaders]);

  const fields: Array<{
    key: keyof AdminProfile;
    label: string;
    type?: string;
    icon: LucideIcon;
    control?: 'input' | 'select' | 'textarea';
    options?: readonly string[];
    fullWidth?: boolean;
  }> = [
    { key: 'fullName', label: 'Họ và tên', icon: UserRound },
    { key: 'position', label: 'Chức vụ', icon: IdCard, control: 'select', options: ADMIN_POSITION_OPTIONS },
    { key: 'unit', label: 'Ban/Đơn vị', icon: Building2, control: 'select', options: DEPARTMENTS },
    { key: 'className', label: 'Lớp', icon: GraduationCap },
    { key: 'transportation', label: 'Phương tiện di chuyển', icon: Car },
    { key: 'address', label: 'Địa chỉ', icon: MapPin, control: 'textarea', fullWidth: true },
    { key: 'schoolEmail', label: 'Email trường', type: 'email', icon: Mail },
    { key: 'personalEmail', label: 'Email cá nhân', type: 'email', icon: Mail },
    { key: 'phone', label: 'Số điện thoại', type: 'tel', icon: Phone },
    { key: 'studentId', label: 'Mã số sinh viên', icon: IdCard },
  ];

  const startEditing = () => {
    setDraft(profile);
    setSaved(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setSaved(false);
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || 'Không lưu được hồ sơ cá nhân.');
      setProfile(payload.data);
      setDraft(payload.data);
      setIsEditing(false);
      setSaved(true);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : String(error));
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <main className="min-w-0 flex-1 bg-[#f3f6fa]">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:py-10">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="mt-2 font-headline text-3xl font-semibold tracking-[-0.03em] text-[#0b1f33]">
              Hồ sơ cá nhân
            </h1>
            <p className="mt-2 text-sm text-slate-500">Thông tin tài khoản và quyền truy cập của bạn.</p>
          </div>
          <Badge variant="outline" className="w-fit rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
            {loadingProfile ? 'Đang tải dữ liệu' : profileError ? 'Lỗi kết nối dữ liệu' : 'Đã kết nối cơ sở dữ liệu'}
          </Badge>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-semibold text-[#0b1f33]">Thông tin cơ bản</h2>
              </div>
              {!isEditing && (
                <Button type="button" variant="outline" size="sm" onClick={startEditing} disabled={loadingProfile} className="rounded-lg">
                  <Pencil className="h-3.5 w-3.5" />
                  Chỉnh sửa
                </Button>
              )}
            </div>

            {profileError && (
              <p className="mx-5 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 sm:mx-6">
                {profileError}
              </p>
            )}

            <div className="grid gap-x-5 gap-y-4 p-5 sm:grid-cols-2 sm:p-6">
              {fields.map(({ key, label, type = 'text', icon: Icon, control = 'input', options, fullWidth }) => (
                <div key={key} className={fullWidth ? 'sm:col-span-2' : undefined}>
                  <label htmlFor={`profile-${key}`} className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    {label}
                  </label>
                  {control === 'select' ? (
                    <select
                      id={`profile-${key}`}
                      value={isEditing ? draft[key] : profile[key]}
                      onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                      disabled={!isEditing}
                      className={`h-11 w-full rounded-lg border px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[#0b4f8a] focus:ring-offset-2 disabled:cursor-default disabled:opacity-100 ${
                        isEditing
                          ? 'border-slate-200 bg-white text-slate-900'
                          : 'border-slate-100 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <option value="">Chưa cập nhật</option>
                      {options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : control === 'textarea' ? (
                    <Textarea
                      id={`profile-${key}`}
                      value={isEditing ? draft[key] : profile[key]}
                      onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                      readOnly={!isEditing}
                      rows={3}
                      className={`resize-none rounded-lg ${
                        isEditing ? 'bg-white' : 'border-slate-100 bg-slate-50 text-slate-600'
                      }`}
                    />
                  ) : (
                    <Input
                      id={`profile-${key}`}
                      type={type}
                      value={isEditing ? draft[key] : profile[key]}
                      onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                      readOnly={!isEditing}
                      className={`h-11 rounded-lg ${isEditing ? 'bg-white' : 'border-slate-100 bg-slate-50 text-slate-600'}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {(isEditing || saved) && (
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
                <p className={`text-xs ${saved ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {saved ? 'Đã lưu thay đổi vào cơ sở dữ liệu.' : 'Kiểm tra thông tin trước khi lưu.'}
                </p>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={cancelEditing} className="rounded-lg">
                      Hủy
                    </Button>
                    <Button type="submit" size="sm" disabled={savingProfile} className="rounded-lg bg-[#0b4f8a] text-white hover:bg-[#073e70]">
                      {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </form>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#0b3767] text-sm font-bold text-white">QT</div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#0b1f33]">{profile.fullName}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {profile.accountEmail || profile.schoolEmail}
                  </p>
                </div>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Vai trò</p>
                <div className="mt-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#F05A23]" />
                  <span className="text-sm font-semibold text-slate-700">{profile.position}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-[#0b4f8a]" />
                <h2 className="font-semibold text-[#0b1f33]">Quyền truy cập</h2>
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {[
                  ['Nội dung website', 'Đọc và chỉnh sửa'],
                  ['Đơn đăng ký', 'Toàn quyền'],
                  ['Cấu hình hệ thống', 'Toàn quyền'],
                  ['Quản lý tài khoản', 'Toàn quyền'],
                ].map(([name, access]) => (
                  <div key={name} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-600">{name}</span>
                      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{access}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [checkingGoogleSession, setCheckingGoogleSession] = useState(true);
  const [authMethod, setAuthMethod] = useState<'password' | 'google' | null>(null);
  const [authRole, setAuthRole] = useState<AdminRole>('admin');
  const [googleEmail, setGoogleEmail] = useState('');
  const [adminDisplayName, setAdminDisplayName] = useState('Admin');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<VisitMetrics | null>(null);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [formTemplates, setFormTemplates] = useState<FormTemplateSummary[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [adminSection, setAdminSection] = useState<AdminSection>('general');
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [youthSubOpen, setYouthSubOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const authHeaders = useMemo(() => ({ 'x-admin-password': password }), [password]);

  // ── Auth ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    let active = true;

    const authenticateGoogleSession = async (accessToken: string) => {
      setAuthenticating(true);
      try {
        const response = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (active) {
            setLoginError(payload?.message || 'Tài khoản Google không có quyền truy cập.');
            setIsAuthenticated(false);
          }
          await supabase?.auth.signOut();
          return;
        }

        if (active) {
          setPassword(accessToken);
          setGoogleEmail(String(payload?.email || ''));
          setAdminDisplayName(String(payload?.fullName || payload?.email?.split('@')[0] || 'Admin'));
          setAuthMethod('google');
          setAuthRole(payload?.role === 'super_admin' ? 'super_admin' : 'admin');
          setLoginError(null);
          setIsAuthenticated(true);
        }
      } catch {
        if (active) setLoginError('Không thể xác thực tài khoản Google. Vui lòng thử lại.');
      } finally {
        if (active) {
          setAuthenticating(false);
          setCheckingGoogleSession(false);
        }
      }
    };

    if (!supabase) {
      setCheckingGoogleSession(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session?.access_token) {
        void authenticateGoogleSession(data.session.access_token);
      } else {
        setCheckingGoogleSession(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || !session?.access_token) return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        window.setTimeout(() => {
          if (active) void authenticateGoogleSession(session.access_token);
        }, 0);
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setLoginError(null);

    if (!password.trim()) {
      setLoginError('Vui lòng nhập mật khẩu quản trị.');
      return;
    }

    setAuthenticating(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setLoginError(payload?.message || 'Mật khẩu sai, vui lòng nhập lại!');
        return;
      }
      setAuthMethod('password');
      setAuthRole('admin');
      setGoogleEmail('');
      setAdminDisplayName('Admin');
      setIsAuthenticated(true);
    } catch {
      setLoginError('Không thể xác thực admin. Vui lòng thử lại.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError(null);

    if (!supabase) {
      setLoginError('Supabase chưa được cấu hình nên chưa thể đăng nhập Google.');
      return;
    }

    setAuthenticating(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      setLoginError(`Không thể mở đăng nhập Google: ${error.message}`);
      setAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    if (authMethod === 'google') {
      await supabase?.auth.signOut();
    }
    setIsAuthenticated(false);
    setPassword('');
    setGoogleEmail('');
    setAdminDisplayName('Admin');
    setAuthMethod(null);
    setAuthRole('admin');
    setAdminSection('general');
  };

  // ── Data loading ──────────────────────────────────────────────────────────

  const reloadData = async (headers: Record<string, string>) => {
    setLoadingData(true);
    try {
      const [metricsRes, subsRes, formsRes] = await Promise.all([
        fetch('/api/admin/visits', { headers }),
        fetch('/api/admin/application-form-submissions?includeAll=true', { headers }),
        fetch('/api/admin/forms', { headers }),
      ]);
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (subsRes.ok) {
        const payload = await subsRes.json();
        setTotalSubmissions(payload?.total ?? 0);
        setFormSubmissions(Array.isArray(payload?.data) ? payload.data : []);
      }
      if (formsRes.ok) {
        const payload = await formsRes.json();
        setFormTemplates(Array.isArray(payload?.data) ? payload.data : []);
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    reloadData(authHeaders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    fetch('/api/site-config')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setSiteConfig(d))
      .catch(() => null);
  }, []);

  // ── Login screen ──────────────────────────────────────────────────────────

  if (checkingGoogleSession) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#06182b] text-white">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Loader2 className="h-5 w-5 animate-spin text-[#F05A23]" />
          Đang kiểm tra phiên đăng nhập…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06182b] p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(32,100,168,0.35),transparent_34%),radial-gradient(circle_at_82%_82%,rgba(240,90,35,0.2),transparent_32%)]" />
        <div className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full border-[80px] border-white/[0.025]" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[70px] border-[#F05A23]/10" />

        <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-[0_40px_120px_rgba(0,0,0,0.45)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative hidden min-h-[610px] overflow-hidden bg-[#0b3767] p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]" />
            <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full border-[64px] border-white/[0.05]" />
            <div className="relative">
              <div className="inline-flex rounded-2xl bg-white px-4 py-3 shadow-xl">
                <img src="/images/logo.png" alt="ĐKTCNH Logo" className="h-10 w-auto" />
              </div>
            </div>
            <div className="relative">
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-[#F05A23] shadow-lg shadow-black/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="max-w-md font-headline text-4xl font-semibold leading-tight tracking-[-0.04em]">
                THẲNG CÁI LƯNG LÊN!
              </p>
              <p className="max-w-md font-headline text-4xl font-semibold leading-tight tracking-[-0.04em]">
                THẲNG CÁI LƯNG LÊN!
              </p>
              <p className="max-w-md font-headline text-4xl font-semibold leading-tight tracking-[-0.04em]">
                THẲNG CÁI LƯNG LÊN!
              </p>
            </div>
            <div className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              <CircleDot className="h-3.5 w-3.5 text-emerald-400" />
              Đoàn Khoa Tài chính — Ngân hàng
            </div>
          </div>

          <form
            className="flex min-h-[560px] flex-col justify-center px-7 py-12 sm:px-14 lg:min-h-[610px]"
            onSubmit={(event) => {
              event.preventDefault();
              handleLogin();
            }}
          >
            <div className="mb-10 inline-flex w-fit rounded-2xl bg-slate-50 p-3 lg:hidden">
              <img src="/images/logo.png" alt="ĐKTCNH Logo" className="h-9 w-auto" />
            </div>
            <div className="mb-8">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf2fa] text-[#0b4f8a]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="mt-3 font-extrabold text-3xl tracking-[-0.03em] text-[#F05A23]">
                ADMIN WORKSPACE
              </h1>
            </div>

            <Input
              id="admin-password"
              type="password"
              placeholder="Nhập mật khẩu quản trị"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus-visible:ring-[#0b4f8a]"
            />
            {loginError && (
              <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {loginError}
              </p>
            )}
            <Button
              type="submit"
              disabled={authenticating}
              className="mt-5 h-12 w-full rounded-xl bg-[#0b4f8a] font-bold text-white shadow-lg shadow-[#0b4f8a]/20 hover:bg-[#073e70]"
            >
              {authenticating
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang xác thực…</>
                : <>Đăng nhập bằng mật khẩu<ArrowUpRight className="ml-2 h-4 w-4" /></>}
            </Button>

            <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              hoặc
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={authenticating}
              onClick={handleGoogleLogin}
              className="h-12 w-full rounded-xl border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50"
            >
              <span className="mr-3 grid h-6 w-6 place-items-center rounded-full border border-slate-200 font-extrabold text-[#4285F4]">
                G
              </span>
              Đăng nhập bằng Google
            </Button>
            <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
              Chỉ các tài khoản super admin đã được cấp quyền mới có thể truy cập.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ── Authenticated layout ──────────────────────────────────────────────────

  // Sidebar content (shared between desktop and mobile drawer)
  const sidebarContent = (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 bg-[#144E8C] text-white/90">
        {/* Overview */}
        <SidebarBtn
          icon={LayoutDashboard}
          label="Tổng quan"
          active={activeTab === 'overview'}
          onClick={() => {
            setActiveTab('overview');
            setSidebarOpen(false);
          }}
        />
        <SidebarBtn
          icon={Wrench}
          label="Kiểm thử kết nối"
          active={activeTab === 'function'}
          onClick={() => {
            setActiveTab('function');
            setSidebarOpen(false);
          }}
        />

        {/* Category — collapsible */}
        <div className="pt-4">
          <button
            onClick={() => setCategoryOpen(o => !o)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/90 transition-colors hover:bg-white/[0.05] hover:text-white/60"
          >
            <span className="flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" />
              Danh mục trang
            </span>
            {categoryOpen
              ? <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {categoryOpen && (
            <div className="mt-1 space-y-0.5 pl-2">
              <SidebarBtn
                icon={Home}
                label="Trang chủ"
                active={activeTab === 'category-home'}
                onClick={() => {
                  setActiveTab('category-home');
                  setSidebarOpen(false);
                }}
              />
              <SidebarBtn
                icon={Trophy}
                label="Thành tích"
                active={activeTab === 'category-achievements'}
                onClick={() => {
                  setActiveTab('category-achievements');
                  setSidebarOpen(false);
                }}
              />
              <SidebarBtn
                icon={FolderOpen}
                label="Cơ cấu"
                active={activeTab === 'category-structure'}
                onClick={() => {
                  setActiveTab('category-structure');
                  setSidebarOpen(false);
                }}
              />
              <SidebarBtn
                icon={Activity}
                label="Hoạt động"
                active={activeTab === 'category-activities'}
                onClick={() => {
                  setActiveTab('category-activities');
                  setSidebarOpen(false);
                }}
              />
              <SidebarBtn
                icon={Sparkles}
                label="Tuổi trẻ"
                active={activeTab === 'category-youth-activities'}
                onClick={() => {
                  setActiveTab('category-youth-activities');
                  setSidebarOpen(false);
                }}
              />
              <SidebarBtn
                icon={MessageSquare}
                label="Diễn đàn"
                active={activeTab === 'category-forum'}
                onClick={() => {
                  setActiveTab('category-forum');
                  setSidebarOpen(false);
                }}
              />
              <SidebarBtn
                icon={FileText}
                label="Tạo đơn đăng ký"
                active={activeTab === 'category-apply'}
                onClick={() => {
                  setActiveTab('category-apply');
                  setSidebarOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar footer */}
      <div className="space-y-1 border-t border-white/50 bg-[#144E8C] p-3">
        {authMethod === 'google' && googleEmail && (
          <p className="truncate px-3 pb-2 text-xs font-semibold text-white/45" title={googleEmail}>
            {googleEmail}
          </p>
        )}
        {siteConfig?.showAdminLink && (
          <a
            href={siteConfig.frontendUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
            Xem website
          </a>
        )}
        <button
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </>
  );

  const activeTabMeta = ADMIN_TAB_META[activeTab];

  return (
    <div className="min-h-screen bg-[#f3f6fa] text-[#0b1f33]">
      <AdminWorkspaceHeader
        section={adminSection}
        showPersonalProfile={authMethod === 'google'}
        onSectionChange={setAdminSection}
        onLogout={() => void handleLogout()}
      />

      {adminSection === 'general' ? (
      <>
      {/* Mobile header with hamburger button */}
      <div className="sticky top-[112px] z-40 flex items-center justify-between border-b border-white/10 bg-[#071d33] px-4 py-3 text-white sm:top-[60px] md:hidden">
        <div className="flex items-center gap-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2 text-white hover:bg-white/10 hover:text-white">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto border-r-0 bg-[#071d33] p-0 text-white">
              <div className="flex h-full flex-col bg-[#071d33]">
                {sidebarContent}
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#F05A23]">{activeTabMeta.eyebrow}</p>
            <p className="font-headline text-sm font-semibold">{activeTabMeta.title}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Online
        </span>
      </div>

      <div className="flex min-h-[calc(100vh-60px)] xl:min-h-[calc(100vh-104px)]">
        {/* Desktop Sidebar */}
        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-72 shrink-0 flex-col overflow-y-auto bg-[#071d33] md:flex xl:top-[104px] xl:h-[calc(100vh-104px)]">
          {sidebarContent}
        </aside>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1">
          <header className="sticky top-[60px] z-30 hidden border-b border-slate-200/80 bg-white/90 px-8 py-4 backdrop-blur-xl md:block xl:top-[104px]">
            <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6">
              <div className="min-w-0">
                <h1 className="mt-1 truncate uppercase text-xl font-extrabold tracking-[-0.02em] text-[#F05A23]">
                  TRANG "{activeTabMeta.title}"
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right lg:block">
                  <p className="text-xs font-bold text-slate-600">
                    {new Intl.DateTimeFormat('vi-VN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      timeZone: 'Asia/Ho_Chi_Minh',
                    }).format(new Date())}
                  </p>
                  <p className="mt-0.5 flex items-center justify-end gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Hệ thống hoạt động
                  </p>
                </div>
                {siteConfig?.showAdminLink && (
                  <a
                    href={siteConfig.frontendUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0b4f8a]/25 hover:text-[#0b4f8a] hover:shadow-md"
                  >
                    Xem website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1440px] p-4 pb-16 sm:p-6 md:p-8">
            {activeTab === 'overview' && (
              <OverviewPanel
                metrics={metrics}
                totalSubmissions={totalSubmissions}
                submissions={formSubmissions}
                templates={formTemplates}
                authHeaders={authHeaders}
                displayName={adminDisplayName}
                onReload={() => reloadData(authHeaders)}
                loadingData={loadingData}
              />
            )}
            {activeTab === 'function' && (
              <FunctionPanel authHeaders={authHeaders} />
            )}
            {activeTab === 'schema' && (
              <SchemaPanel authHeaders={authHeaders} />
            )}
            {activeTab === 'category-home' && <CategoryHomePanel authHeaders={authHeaders} />}
            {activeTab === 'category-structure' && <CategoryStructurePanel adminPassword={password} />}
            {activeTab === 'category-achievements' && <CategoryAchievementsPanel adminPassword={password} />}
            {activeTab === 'category-activities' && <CategoryActivitiesPanel adminPassword={password} />}
            {activeTab === 'category-youth-activities' && <CategoryYouthPanel adminPassword={password} />}
            {activeTab === 'category-youth-student-info' && <CategoryStudentInfoPanel />}
            {activeTab === 'category-youth-school-map' && <CategoryYouthSchoolMapPanel adminPassword={password} />}
            {activeTab === 'category-apply' && (
              <ApplicationFormsAdmin adminPassword={password} />
            )}
            {activeTab === 'category-partners' && <CategoryPartnersPanel adminPassword={password} />}
            {activeTab === 'category-forum' && (
              <ForumManagementPanel adminPassword={password} />
            )}
            {activeTab === 'category-blog-testimonials' && <CategoryBlogTestimonialsPanel adminPassword={password} />}
            {activeTab === 'category-blog-discussions' && <CategoryBlogDiscussionsPanel adminPassword={password} />}
          </div>
        </main>
      </div>
      </>
      ) : authRole === 'super_admin' ? (
        <SuperAdminPanel authHeaders={authHeaders} />
      ) : (
        <PersonalProfilePanel authHeaders={authHeaders} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel: Overview
// ─────────────────────────────────────────────────────────────────────────────

function OverviewPanel({
  metrics,
  totalSubmissions,
  submissions,
  templates,
  authHeaders,
  displayName,
  onReload,
  loadingData,
}: {
  metrics: VisitMetrics | null;
  totalSubmissions: number;
  submissions: FormSubmission[];
  templates: FormTemplateSummary[];
  authHeaders: Record<string, string>;
  displayName: string;
  onReload: () => void;
  loadingData: boolean;
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('all');
  const [tableSortBy, setTableSortBy] = useState<'submitted_at' | 'full_name' | 'department' | 'class_name' | 'student_id' | 'email' | 'status'>('submitted_at');
  const [tableSortOrder, setTableSortOrder] = useState<'asc' | 'desc'>('desc');
  const [tableSearch, setTableSearch] = useState('');
  const [tableDepartmentFilter, setTableDepartmentFilter] = useState('all');
  const [tableClassFilter, setTableClassFilter] = useState('all');
  const [tableStatusFilter, setTableStatusFilter] = useState<'all' | CandidateStatus>('all');
  const [detailSubmission, setDetailSubmission] = useState<FormSubmission | null>(null);
  const [selectedAdditionalFields, setSelectedAdditionalFields] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(DEFAULT_COLUMN_WIDTHS);

  // ── Inline submission updates (status + comments) ──────────────────────────
  const [submissionUpdates, setSubmissionUpdates] = useState<Record<string, { status: CandidateStatus; standingComment: string; boardComment: string; teamLeaderComment: string }>>({});
  const [dialogStatus, setDialogStatus] = useState<CandidateStatus>('not_selected');
  const [dialogStandingComment, setDialogStandingComment] = useState('');
  const [dialogBoardComment, setDialogBoardComment] = useState('');
  const [dialogTeamLeaderComment, setDialogTeamLeaderComment] = useState('');
  const [savingDetail, setSavingDetail] = useState(false);
  const [saveDetailError, setSaveDetailError] = useState<string | null>(null);
  const [saveDetailSuccess, setSaveDetailSuccess] = useState(false);
  const [detailTemplate, setDetailTemplate] = useState<FormTemplateSummary | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [showFormsAnalytics, setShowFormsAnalytics] = useState(false);
  const selectedTemplate = useMemo(
    () => templates.find(t => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const filteredSubmissions = useMemo(() => {
    if (selectedTemplateId === 'all') return submissions;
    return submissions.filter(item => item.template_id === selectedTemplateId);
  }, [submissions, selectedTemplateId]);

  const departmentStats = useMemo(() => {
    const map = new Map<string, { count: number; completionSum: number }>();

    for (const item of filteredSubmissions) {
      const key = item.department || 'Unknown';
      const current = map.get(key) || { count: 0, completionSum: 0 };
      const personalAnswered = Array.isArray(item.optional_personal_answers)
        ? item.optional_personal_answers.slice(0, 5).filter(a => String(a || '').trim()).length
        : 0;
      const deptAnswered = Array.isArray(item.dept_optional_answers)
        ? item.dept_optional_answers.slice(0, 3).filter(a => String(a || '').trim()).length
        : 0;
      const completionRate = Math.round(((personalAnswered + deptAnswered) / 8) * 100);

      current.count += 1;
      current.completionSum += completionRate;
      map.set(key, current);
    }

    return Array.from(map.entries()).map(([department, values]) => ({
      department,
      count: values.count,
      avgCompletion: Math.round(values.completionSum / Math.max(values.count, 1)),
    }));
  }, [filteredSubmissions]);

  const sortedRows = useMemo(() => {
    const rows = [...filteredSubmissions];
    rows.sort((a, b) => {
      if (tableSortBy === 'submitted_at') {
        const ta = new Date(a.submitted_at).getTime();
        const tb = new Date(b.submitted_at).getTime();
        return tableSortOrder === 'desc' ? tb - ta : ta - tb;
      }

      if (tableSortBy === 'status') {
        const statusOrder = ['not_selected', 'undecided', 'accepted', 'rejected'];
        const statusA = (a.status as string) || 'not_selected';
        const statusB = (b.status as string) || 'not_selected';
        const indexA = statusOrder.indexOf(statusA);
        const indexB = statusOrder.indexOf(statusB);
        return tableSortOrder === 'desc' ? indexB - indexA : indexA - indexB;
      }

      const va = String((a as any)[tableSortBy] ?? '');
      const vb = String((b as any)[tableSortBy] ?? '');

      return tableSortOrder === 'desc'
        ? vb.localeCompare(va)
        : va.localeCompare(vb);
    });
    return rows;
  }, [filteredSubmissions, tableSortBy, tableSortOrder]);

  const departmentFilterOptions = useMemo(() => {
    return Array.from(
      new Set(filteredSubmissions.map((item) => (item.department || 'Unknown').trim() || 'Unknown'))
    ).sort((a, b) => a.localeCompare(b));
  }, [filteredSubmissions]);

  const classFilterOptions = useMemo(() => {
    return Array.from(
      new Set(filteredSubmissions.map((item) => (item.class_name || 'N/A').trim() || 'N/A'))
    ).sort((a, b) => a.localeCompare(b));
  }, [filteredSubmissions]);

  const getEffectiveStatus = (row: FormSubmission): CandidateStatus => {
    const update = submissionUpdates[row.id];
    if (update) return update.status;
    const raw = row.status ?? 'not_selected';
    return (raw in CANDIDATE_STATUS ? raw : 'not_selected') as CandidateStatus;
  };

  const excelRows = useMemo(() => {
    const search = tableSearch.trim().toLowerCase();
    return sortedRows.filter((row) => {
      const department = (row.department || 'Unknown').trim() || 'Unknown';
      const className = (row.class_name || 'N/A').trim() || 'N/A';

      if (tableDepartmentFilter !== 'all' && department !== tableDepartmentFilter) {
        return false;
      }

      if (tableClassFilter !== 'all' && className !== tableClassFilter) {
        return false;
      }

      if (tableStatusFilter !== 'all' && getEffectiveStatus(row) !== tableStatusFilter) {
        return false;
      }

      if (!search) return true;

      const haystack = [
        row.full_name,
        row.department,
        row.class_name,
        row.student_id,
        row.email,
        row.phone_number,
        row.hometown,
      ]
        .map((v) => String(v || '').toLowerCase())
        .join(' ');

      return haystack.includes(search);
    });
  }, [sortedRows, tableSearch, tableDepartmentFilter, tableClassFilter, tableStatusFilter, submissionUpdates]);

  const onHeaderSort = (column: 'submitted_at' | 'full_name' | 'department' | 'class_name' | 'student_id' | 'email' | 'status') => {
    if (tableSortBy === column) {
      setTableSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setTableSortBy(column);
    setTableSortOrder(column === 'submitted_at' ? 'desc' : 'asc');
  };

  const getColumnWidth = (column: string) => columnWidths[column] ?? DEFAULT_COLUMN_WIDTHS[column] ?? 120;

  const handleColumnResize = (column: string, delta: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [column]: Math.max(60, (prev[column] ?? DEFAULT_COLUMN_WIDTHS[column] ?? 120) + delta),
    }));
  };

  const tableWidth = useMemo(() => {
    const visibleColumns = [
      'submit_index',
      'full_name',
      'class_name',
      'department',
      'status',
      ...selectedAdditionalFields,
      'details',
    ];

    return visibleColumns.reduce((total, column) => total + getColumnWidth(column), 0);
  }, [columnWidths, selectedAdditionalFields]);

  const genderStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of filteredSubmissions) {
      const g = (row.gender || 'Không rõ').trim() || 'Không rõ';
      map.set(g, (map.get(g) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredSubmissions]);

  const classStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of filteredSubmissions) {
      const c = (row.class_name || 'N/A').trim() || 'N/A';
      map.set(c, (map.get(c) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([className, count]) => ({ className, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredSubmissions]);

  const statusStats = useMemo(() => {
    const map: Record<CandidateStatus, number> = { not_selected: 0, accepted: 0, undecided: 0, rejected: 0 };
    for (const row of filteredSubmissions) {
      const s = getEffectiveStatus(row);
      map[s] = (map[s] ?? 0) + 1;
    }
    return (Object.entries(map) as [CandidateStatus, number][]).map(([key, value]) => ({
      name: CANDIDATE_STATUS[key].label,
      value,
      key,
    }));
  }, [filteredSubmissions, submissionUpdates]);

  const acceptedByDepartment = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of filteredSubmissions) {
      if (getEffectiveStatus(row) === 'accepted') {
        const dept = (row.department || 'Unknown').trim();
        map.set(dept, (map.get(dept) ?? 0) + 1);
      }
    }
    return Array.from(map.entries()).map(([department, count]) => ({ department, count }));
  }, [filteredSubmissions, submissionUpdates]);

  const acceptedCandidatesByDept = useMemo(() => {
    const map = new Map<string, FormSubmission[]>();
    for (const row of filteredSubmissions) {
      if (getEffectiveStatus(row) === 'accepted') {
        const dept = (row.department || 'Unknown').trim();
        if (!map.has(dept)) map.set(dept, []);
        map.get(dept)!.push(row);
      }
    }
    return Array.from(map.entries())
      .map(([dept, candidates]) => ({ dept, candidates }))
      .sort((a, b) => a.dept.localeCompare(b.dept));
  }, [filteredSubmissions, submissionUpdates]);

  const openDetail = async (row: FormSubmission) => {
    const update = submissionUpdates[row.id];
    setDialogStatus(update?.status ?? (row.status as CandidateStatus | undefined) ?? 'not_selected');
    setDialogStandingComment(update?.standingComment ?? row.standing_committee_comment ?? '');
    setDialogBoardComment(update?.boardComment ?? row.board_comment ?? '');
    setDialogTeamLeaderComment(update?.teamLeaderComment ?? row.team_leader_comment ?? '');
    setSaveDetailError(null);
    setSaveDetailSuccess(false);
    setDetailTemplate(templates.find(t => t.id === row.template_id) ?? null);
    setDetailSubmission(row);
    // Fetch full template (including question data) in background
    if (row.template_id) {
      setLoadingTemplate(true);
      try {
        const res = await fetch(`/api/admin/forms/${row.template_id}`, { headers: authHeaders });
        if (res.ok) {
          const payload = await res.json();
          if (payload?.data) setDetailTemplate(payload.data);
        }
      } catch { /* ignore */ } finally {
        setLoadingTemplate(false);
      }
    }
  };

  const saveDetailChanges = async () => {
    if (!detailSubmission) return;
    setSavingDetail(true);
    setSaveDetailError(null);
    setSaveDetailSuccess(false);
    try {
      const res = await fetch(`/api/admin/application-form-submissions/${detailSubmission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          status: dialogStatus,
          standing_committee_comment: dialogStandingComment,
          board_comment: dialogBoardComment,
          team_leader_comment: dialogTeamLeaderComment,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || `Lỗi ${res.status}`);
      }
      setSubmissionUpdates(prev => ({
        ...prev,
        [detailSubmission.id]: {
          status: dialogStatus,
          standingComment: dialogStandingComment,
          boardComment: dialogBoardComment,
          teamLeaderComment: dialogTeamLeaderComment,
        },
      }));
      setSaveDetailSuccess(true);
    } catch (e) {
      setSaveDetailError(String(e instanceof Error ? e.message : e));
    } finally {
      setSavingDetail(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenFormsAnalytics = () => {
    if (!showFormsAnalytics) {
      setShowFormsAnalytics(true);
      setTimeout(() => scrollToSection('forms-analytics-section'), 80);
      return;
    }
    scrollToSection('forms-analytics-section');
  };

  return (
    <div>
      <div className="relative mb-6 overflow-hidden rounded-[28px] bg-[#0b3767] px-6 py-7 text-white shadow-[0_24px_60px_rgba(11,55,103,0.2)] sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(240,90,35,0.32),transparent_25%),linear-gradient(120deg,rgba(255,255,255,0.06),transparent_48%)]" />
        <div className="pointer-events-none absolute -bottom-24 right-8 h-64 w-64 rounded-full border-[50px] border-white/[0.04]" />
        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="max-w-2xl font-headline text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
              Hề lố {displayName}!
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={onReload}
            disabled={loadingData}
            className="h-11 shrink-0 rounded-xl border-white/15 bg-white/10 px-5 font-bold text-white backdrop-blur-sm hover:bg-white hover:text-[#0b3767]"
          >
            {loadingData
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tải…</>
              : <><RefreshCw className="mr-2 h-4 w-4" />Làm mới dữ liệu</>}
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <Card className="overflow-hidden rounded-2xl border-0 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold tracking-[0.12em] text-slate-400">Số lượng đơn đã nộp</p>
                <p className="mt-2 font-headline text-3xl font-semibold tracking-tight text-[#0b1f33]">{totalSubmissions}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0ea]">
                <ClipboardList className="h-5 w-5 text-[#F05A23]" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Visual navigation */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          onClick={handleOpenFormsAnalytics}
          className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition-all hover:-translate-y-1 hover:border-[#0b4f8a]/15 hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)]"
        >
          <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#F05A23]" />
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf2fa] text-[#0b4f8a]">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-slate-700 group-hover:text-[#0b4f8a]">Đơn đăng ký</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Hiển thị danh sách và phân tích đơn</p>
        </button>

        <button
          onClick={() => scrollToSection('candidate-stats-section')}
          className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)]"
        >
          <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-500" />
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-slate-700 group-hover:text-violet-700">Dữ liệu ứng viên</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Theo ban, giới tính và lớp</p>
        </button>

        <button
          onClick={() => scrollToSection('recruitment-results-section')}
          className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)]"
        >
          <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-500" />
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Kết quả tuyển</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Thống kê trạng thái ứng viên</p>
        </button>

        <button
          onClick={() => scrollToSection('accepted-candidates-section')}
          className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition-all hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)]"
        >
          <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-500" />
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <ClipboardList className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-slate-700 group-hover:text-amber-700">Tân cộng tác viên</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Danh sách trúng tuyển theo ban</p>
        </button>
      </div>

      {showFormsAnalytics && (
      <div id="forms-analytics-section" className="mt-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-700">Dữ liệu đơn đăng ký</h2>
          </div>
        </div>

        <Card className="mb-4">
          <CardContent className="pt-5">
            <div className="grid md:grid-cols-[1.2fr_1fr_1fr] gap-3">
              <div>
                <label className="text-xs text-slate-500">Đơn đăng ký</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">Chọn form...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500">Sắp xếp theo</label>
                <select
                  value={tableSortBy}
                  onChange={(e) => setTableSortBy(e.target.value as 'submitted_at' | 'full_name' | 'department' | 'class_name' | 'student_id' | 'email' | 'status')}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="submitted_at">Thời gian</option>
                  <option value="full_name">Tên</option>
                  <option value="department">Ban</option>
                  <option value="class_name">Lớp</option>
                  <option value="student_id">MSSV</option>
                  <option value="email">Email</option>
                  <option value="status">Trạng thái</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500">Thứ tự</label>
                <select
                  value={tableSortOrder}
                  onChange={(e) => setTableSortOrder(e.target.value as 'asc' | 'desc')}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="desc">Giảm dần</option>
                  <option value="asc">Tăng dần</option>
                </select>
              </div>
            </div>

            {selectedTemplate && (
              <div className="mt-3 text-xs text-slate-500">
                Đơn đăng ký đã chọn: <span className="font-medium text-slate-700">{selectedTemplate.name}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedTemplateId === 'all' && (
          <Card className="mb-4">
            <CardContent className="py-10 text-center text-slate-500 italic">
              Chọn một Đơn đăng ký để hiển thị <span className="font-medium text-slate-700">Danh sách câu trả lời</span>.
            </CardContent>
          </Card>
        )}

        {selectedTemplateId !== 'all' && (
          <>
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Danh sách câu trả lời</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
              <Input
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Tìm theo tên, ban, lớp, MSSV, email..."
              />

              <select
                value={tableDepartmentFilter}
                onChange={(e) => setTableDepartmentFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">Ban</option>
                {departmentFilterOptions.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>

              <select
                value={tableClassFilter}
                onChange={(e) => setTableClassFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">Lớp</option>
                {classFilterOptions.map((className) => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>

              <select
                value={tableStatusFilter}
                onChange={(e) => setTableStatusFilter(e.target.value as 'all' | CandidateStatus)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">Trạng thái</option>
                {(Object.entries(CANDIDATE_STATUS) as [CandidateStatus, typeof CANDIDATE_STATUS[CandidateStatus]][]).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>

              <Button
                variant="outline"
                onClick={() => {
                  setTableSearch('');
                  setTableDepartmentFilter('all');
                  setTableClassFilter('all');
                  setTableStatusFilter('all');
                }}
              >
                Xóa
              </Button>
            </div>
          
            {/* Additional Fields Selector */}
            <div className="flex flex-wrap gap-2 mb-3">
              {['student_id', 'email', 'birth_date', 'gender', 'submitted_at'].map((field) => {
                const label = {
                  'student_id': 'MSSV',
                  'email': 'Email',
                  'birth_date': 'Ngày sinh',
                  'gender': 'Giới tính',
                  'submitted_at': 'Thời gian nộp',
                }[field] || field;
                const isSelected = selectedAdditionalFields.includes(field);
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => {
                      setSelectedAdditionalFields(prev =>
                        isSelected
                          ? prev.filter(f => f !== field)
                          : [...prev, field]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                      isSelected
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Resizable Table */}
            <div className="relative overflow-x-auto rounded-lg border bg-white">
              <table className="min-w-full table-fixed border-separate border-spacing-0" style={{ width: `${tableWidth}px` }}>
                <colgroup>
                  <col style={{ width: `${getColumnWidth('submit_index')}px` }} />
                  <col style={{ width: `${getColumnWidth('full_name')}px` }} />
                  <col style={{ width: `${getColumnWidth('class_name')}px` }} />
                  <col style={{ width: `${getColumnWidth('department')}px` }} />
                  <col style={{ width: `${getColumnWidth('status')}px` }} />
                  {selectedAdditionalFields.includes('student_id') && <col style={{ width: `${getColumnWidth('student_id')}px` }} />}
                  {selectedAdditionalFields.includes('email') && <col style={{ width: `${getColumnWidth('email')}px` }} />}
                  {selectedAdditionalFields.includes('birth_date') && <col style={{ width: `${getColumnWidth('birth_date')}px` }} />}
                  {selectedAdditionalFields.includes('gender') && <col style={{ width: `${getColumnWidth('gender')}px` }} />}
                  {selectedAdditionalFields.includes('submitted_at') && <col style={{ width: `${getColumnWidth('submitted_at')}px` }} />}
                  <col style={{ width: `${getColumnWidth('details')}px` }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200 text-center text-xl font-semibold text-slate-500 uppercase tracking-wider">
                    <ResizableTableHeaderCell
                      column="submit_index"
                      label="#"
                      width={getColumnWidth('submit_index')}
                      onResize={(delta) => handleColumnResize('submit_index', delta)}
                    />
                    <ResizableTableHeaderCell
                      column="full_name"
                      label="Tên"
                      width={getColumnWidth('full_name')}
                      onResize={(delta) => handleColumnResize('full_name', delta)}
                      onSort={() => onHeaderSort('full_name')}
                      isSorted={tableSortBy === 'full_name'}
                      sortOrder={tableSortOrder}
                    />
                    <ResizableTableHeaderCell
                      column="class_name"
                      label="Lớp"
                      width={getColumnWidth('class_name')}
                      onResize={(delta) => handleColumnResize('class_name', delta)}
                      onSort={() => onHeaderSort('class_name')}
                      isSorted={tableSortBy === 'class_name'}
                      sortOrder={tableSortOrder}
                    />
                    <ResizableTableHeaderCell
                      column="department"
                      label="Ban"
                      width={getColumnWidth('department')}
                      onResize={(delta) => handleColumnResize('department', delta)}
                      onSort={() => onHeaderSort('department')}
                      isSorted={tableSortBy === 'department'}
                      sortOrder={tableSortOrder}
                    />
                    <ResizableTableHeaderCell
                      column="status"
                      label="Trạng thái"
                      width={getColumnWidth('status')}
                      onResize={(delta) => handleColumnResize('status', delta)}
                      onSort={() => onHeaderSort('status')}
                      isSorted={tableSortBy === 'status'}
                      sortOrder={tableSortOrder}
                    />
                    {selectedAdditionalFields.includes('student_id') && (
                      <ResizableTableHeaderCell
                        column="student_id"
                        label="MSSV"
                        width={getColumnWidth('student_id')}
                        onResize={(delta) => handleColumnResize('student_id', delta)}
                      />
                    )}
                    {selectedAdditionalFields.includes('email') && (
                      <ResizableTableHeaderCell
                        column="email"
                        label="Email"
                        width={getColumnWidth('email')}
                        onResize={(delta) => handleColumnResize('email', delta)}
                      />
                    )}
                    {selectedAdditionalFields.includes('birth_date') && (
                      <ResizableTableHeaderCell
                        column="birth_date"
                        label="Ngày sinh"
                        width={getColumnWidth('birth_date')}
                        onResize={(delta) => handleColumnResize('birth_date', delta)}
                      />
                    )}
                    {selectedAdditionalFields.includes('gender') && (
                      <ResizableTableHeaderCell
                        column="gender"
                        label="Giới tính"
                        width={getColumnWidth('gender')}
                        onResize={(delta) => handleColumnResize('gender', delta)}
                      />
                    )}
                    {selectedAdditionalFields.includes('submitted_at') && (
                      <ResizableTableHeaderCell
                        column="submitted_at"
                        label="Thời gian nộp"
                        width={getColumnWidth('submitted_at')}
                        onResize={(delta) => handleColumnResize('submitted_at', delta)}
                      />
                    )}
                    <ResizableTableHeaderCell
                      column="details"
                      label=""
                      width={getColumnWidth('details')}
                      onResize={(delta) => handleColumnResize('details', delta)}
                      className="sticky right-0 z-20 border-l border-blue-500/30 shadow-[-10px_0_14px_-12px_rgba(15,23,42,0.5)]"
                    />
                  </tr>
                </thead>
                <tbody>
                  {excelRows.length > 0 ? excelRows.map((row, idx) => {
                    const effectiveStatus = getEffectiveStatus(row);
                    const cfg = CANDIDATE_STATUS[effectiveStatus];
                    return (
                      <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-center">
                        <td style={{ width: `${getColumnWidth('submit_index')}px`, minWidth: `${getColumnWidth('submit_index')}px`, maxWidth: `${getColumnWidth('submit_index')}px` }} className="border-b border-slate-100 px-2 py-3 text-center text-xs text-slate-500 whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td style={{ width: `${getColumnWidth('full_name')}px`, minWidth: `${getColumnWidth('full_name')}px`, maxWidth: `${getColumnWidth('full_name')}px` }} className="border-b border-slate-100 px-2 py-3 text-sm font-medium text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
                          {row.full_name || 'Unknown'}
                        </td>
                        <td style={{ width: `${getColumnWidth('class_name')}px`, minWidth: `${getColumnWidth('class_name')}px`, maxWidth: `${getColumnWidth('class_name')}px` }} className="border-b border-slate-100 px-2 py-3 text-center text-sm text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
                          {row.class_name || 'N/A'}
                        </td>
                        <td style={{ width: `${getColumnWidth('department')}px`, minWidth: `${getColumnWidth('department')}px`, maxWidth: `${getColumnWidth('department')}px` }} className="border-b border-slate-100 px-2 py-3 text-center text-sm text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
                          {row.department || 'Unknown'}
                        </td>
                        <td style={{ width: `${getColumnWidth('status')}px`, minWidth: `${getColumnWidth('status')}px`, maxWidth: `${getColumnWidth('status')}px` }} className="border-b border-slate-100 px-2 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.circleColor}`} />
                            <span className={`text-xs ${cfg.textColor}`}>{cfg.label}</span>
                          </div>
                        </td>
                        {selectedAdditionalFields.includes('student_id') && (
                          <td style={{ width: `${getColumnWidth('student_id')}px`, minWidth: `${getColumnWidth('student_id')}px`, maxWidth: `${getColumnWidth('student_id')}px` }} className="border-b border-slate-100 px-2 py-3 text-center text-sm text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
                            {row.student_id || 'N/A'}
                          </td>
                        )}
                        {selectedAdditionalFields.includes('email') && (
                          <td style={{ width: `${getColumnWidth('email')}px`, minWidth: `${getColumnWidth('email')}px`, maxWidth: `${getColumnWidth('email')}px` }} className="border-b border-slate-100 px-2 py-3 text-xs text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis">
                            {row.email || 'N/A'}
                          </td>
                        )}
                        {selectedAdditionalFields.includes('birth_date') && (
                          <td style={{ width: `${getColumnWidth('birth_date')}px`, minWidth: `${getColumnWidth('birth_date')}px`, maxWidth: `${getColumnWidth('birth_date')}px` }} className="border-b border-slate-100 px-2 py-3 text-center text-sm text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
                            {row.birth_date || 'N/A'}
                          </td>
                        )}
                        {selectedAdditionalFields.includes('gender') && (
                          <td style={{ width: `${getColumnWidth('gender')}px`, minWidth: `${getColumnWidth('gender')}px`, maxWidth: `${getColumnWidth('gender')}px` }} className="border-b border-slate-100 px-2 py-3 text-center text-sm text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
                            {row.gender || 'N/A'}
                          </td>
                        )}
                        {selectedAdditionalFields.includes('submitted_at') && (
                          <td style={{ width: `${getColumnWidth('submitted_at')}px`, minWidth: `${getColumnWidth('submitted_at')}px`, maxWidth: `${getColumnWidth('submitted_at')}px` }} className="border-b border-slate-100 px-2 py-3 text-center text-xs text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis">
                            {formatDateTime(row.submitted_at)}
                          </td>
                        )}
                        <td style={{ width: `${getColumnWidth('details')}px`, minWidth: `${getColumnWidth('details')}px`, maxWidth: `${getColumnWidth('details')}px` }} className="sticky right-0 z-10 border-b border-l border-slate-100 bg-white px-2 py-3 text-center shadow-[-10px_0_14px_-12px_rgba(15,23,42,0.35)]">
                          <Button size="sm" variant="outline" onClick={() => openDetail(row)}>Chi tiết</Button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6 + selectedAdditionalFields.length} className="text-center text-slate-500 py-8">
                        Không có dữ liệu phù hợp
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ── Candidate Data Statistics ─────────────────────────────── */}
        <Card className="mt-6">
          <div id="candidate-stats-section" />
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Thống kê dữ liệu ứng viên</CardTitle>
            <CardDescription className="text-xs">Phân tích đơn đăng ký theo ban, giới tính và lớp</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bar: registrations by department */}
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 text-center">Số đăng ký theo ban</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={departmentStats} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="department" tick={false} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <RechartsTooltip formatter={(value) => [value, 'Số lượng']} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {departmentStats.map((_, i) => (
                        <Cell key={`dept-${i}`} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                  {departmentStats.map((entry, i) => (
                    <div key={entry.department} className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                      <span className="text-xs text-slate-600">{entry.department}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie: gender */}
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 text-center">Giới tính ứng viên</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={genderStats}
                      cx="50%"
                      cy="45%"
                      outerRadius={72}
                      dataKey="value"
                      nameKey="name"
                    >
                      {genderStats.map((_, i) => (
                        <Cell key={`gender-${i}`} fill={GENDER_PIE_COLORS[i % GENDER_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar: class distribution */}
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 text-center">Số đăng ký theo lớp</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={classStats.slice(0, 6)} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="className" tick={false} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <RechartsTooltip formatter={(value) => [value, 'Số lượng']} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {classStats.slice(0, 6).map((_, i) => (
                        <Cell key={`class-${i}`} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                  {classStats.slice(0, 6).map((entry, i) => (
                    <div key={entry.className} className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: BAR_PALETTE[i % BAR_PALETTE.length] }} />
                      <span className="text-xs text-slate-600">{entry.className}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Application Results Statistics ───────────────────────── */}
        <Card className="mt-6">
          <div id="recruitment-results-section" />
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Thống kê kết quả tuyển Cộng tác viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
              {/* 1/3 — Pie: applicant status */}
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 text-center">Trạng thái ứng viên</p>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={statusStats.filter(s => s.value > 0)}
                      cx="50%"
                      cy="42%"
                      outerRadius={78}
                      dataKey="value"
                      nameKey="name"
                    >
                      {statusStats.filter(s => s.value > 0).map((entry) => (
                        <Cell key={`status-${entry.key}`} fill={STATUS_PIE_COLORS[entry.key as CandidateStatus]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* 2/3 — Bar: accepted per department */}
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 text-center">Số lượng CTV trúng tuyển theo ban</p>
                {acceptedByDepartment.length === 0 ? (
                  <div className="flex h-[260px] items-center justify-center text-sm text-slate-400 italic">
                    Chưa có dữ liệu
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={acceptedByDepartment} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="department" tick={false} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <RechartsTooltip formatter={(value) => [value, 'Đồng ý']} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {acceptedByDepartment.map((_, i) => (
                            <Cell key={`acc-${i}`} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                      {acceptedByDepartment.map((entry, i) => (
                        <div key={entry.department} className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                          <span className="text-xs text-slate-600">{entry.department}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Accepted Candidates by Department ────────────────────── */}
        <Card className="mt-6 mb-2">
          <div id="accepted-candidates-section" />
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Danh sách Tân cộng tác viên</CardTitle>
          </CardHeader>
          <CardContent>
            {acceptedCandidatesByDept.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4 text-center">Chưa có dữ liệu.</p>
            ) : (
              <div className="space-y-6">
                {acceptedCandidatesByDept.map(({ dept, candidates }) => (
                  <div key={dept}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                      <h3 className="font-semibold text-sm text-blue-500">Ban {dept}</h3>
                      <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100 text-xs">
                        {candidates.length} bạn
                      </Badge>
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Họ tên</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">MSSV</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lớp</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {candidates.map((c, i) => (
                            <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="px-3 py-2 text-slate-500 text-xs">{i + 1}</td>
                              <td className="px-3 py-2 font-medium text-slate-800">{c.full_name || 'N/A'}</td>
                              <td className="px-3 py-2 text-slate-600">{c.student_id || 'N/A'}</td>
                              <td className="px-3 py-2 text-slate-600">{c.class_name || 'N/A'}</td>
                              <td className="px-3 py-2 text-slate-600">{c.email || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </>
        )}
      </div>
      )}

      <Dialog open={!!detailSubmission} onOpenChange={(open) => { if (!open) { setDetailSubmission(null); setDetailTemplate(null); } }}>
        <DialogContent className="inset-0 left-0 top-0 m-auto h-fit max-h-[92vh] w-[calc(100%-1.5rem)] max-w-5xl translate-x-0 translate-y-0 overflow-y-auto rounded-2xl border border-slate-200 bg-[#f8fafc] p-0 shadow-xl">
          <DialogHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4 pr-12 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  Hồ sơ ứng viên
                  {loadingTemplate && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-slate-500">
                  Thông tin đăng ký, câu trả lời và nhận xét phỏng vấn
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {detailSubmission && (
            <div className="space-y-5 p-4 sm:p-6">
              {/* ── Profile header ── */}
              <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:grid-cols-[132px_1fr]">
                <div>
                  <img
                    src={detailSubmission.photo_url || 'https://placehold.co/140x170?text=Photo'}
                    alt={detailSubmission.full_name || 'Candidate'}
                    className="mx-auto h-[160px] w-[124px] rounded-xl border border-slate-200 bg-slate-100 object-cover md:mx-0"
                  />
                </div>
                <div className="min-w-0">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-semibold text-slate-950">{detailSubmission.full_name || 'N/A'}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">MSSV {detailSubmission.student_id || 'N/A'}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">{detailSubmission.class_name || 'Chưa có lớp'}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">{detailSubmission.department || 'Chưa chọn ban'}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { label: 'Ngày sinh', value: detailSubmission.birth_date || '—' },
                      { label: 'Giới tính', value: detailSubmission.gender || '—' },
                      { label: 'Số điện thoại', value: detailSubmission.phone_number || '—' },
                      { label: 'Email', value: detailSubmission.email || '—' },
                      { label: 'Quê quán', value: detailSubmission.hometown || '—' },
                      { label: 'Nộp hồ sơ', value: formatDateTime(detailSubmission.submitted_at) },
                    ].map((item) => (
                      <div key={item.label} className="min-w-0">
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{item.label}</p>
                        <p className="break-words font-medium text-slate-700">{item.value}</p>
                      </div>
                    ))}
                    <div className="min-w-0 sm:col-span-2 lg:col-span-3">
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Facebook</p>
                      {detailSubmission.facebook_url ? (
                        <a
                          href={detailSubmission.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 break-all font-medium text-blue-700 hover:underline"
                        >
                          {detailSubmission.facebook_url}
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      ) : (
                        <p className="font-medium text-slate-700">—</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Answers ── */}
              {(() => {
                const tmpl = detailTemplate;
                const personalQs: string[] = Array.isArray(tmpl?.optional_personal_questions)
                  ? (tmpl!.optional_personal_questions as string[]).filter((q: string) => q?.trim())
                  : [];
                const deptQs: string[] = Array.isArray(tmpl?.department_questions?.[detailSubmission.department])
                  ? (tmpl!.department_questions![detailSubmission.department] as string[]).filter((q: string) => q?.trim())
                  : [];
                const personalCount = personalQs.length || detailSubmission.optional_personal_answers?.length || 0;
                const deptCount = deptQs.length || detailSubmission.dept_optional_answers?.length || 0;
                return (
                  <>
                    {personalCount > 0 && (
                      <Card className="rounded-2xl border-slate-200 bg-white shadow-none">
                        <CardHeader className="border-b border-slate-100 pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <MessageSquare className="h-4 w-4 text-slate-500" />
                            Câu hỏi cá nhân
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                          {Array.from({ length: personalCount }).map((_, i) => (
                            <div key={`p-${i}`} className="rounded-xl bg-slate-50 p-3 text-sm">
                              {personalQs[i] && (
                                <p className="mb-2 text-xs font-semibold text-slate-700">Câu {i + 1}: {personalQs[i]}</p>
                              )}
                              {!personalQs[i] && (
                                <p className="text-xs text-slate-400 mb-2">Câu {i + 1}</p>
                              )}
                              <p className="leading-relaxed text-slate-700">{detailSubmission.optional_personal_answers?.[i] || <span className="italic text-slate-400">Chưa trả lời</span>}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                    {deptCount > 0 && (
                      <Card className="rounded-2xl border-slate-200 bg-white shadow-none">
                        <CardHeader className="border-b border-slate-100 pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Users className="h-4 w-4 text-slate-500" />
                            Câu hỏi của ban {detailSubmission.department}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                          {Array.from({ length: deptCount }).map((_, i) => (
                            <div key={`d-${i}`} className="rounded-xl bg-slate-50 p-3 text-sm">
                              {deptQs[i] && (
                                <p className="mb-2 text-xs font-semibold text-slate-700">Câu {i + 1}: {deptQs[i]}</p>
                              )}
                              {!deptQs[i] && (
                                <p className="text-xs text-slate-400 mb-2">Câu {i + 1}</p>
                              )}
                              <p className="leading-relaxed text-slate-700">{detailSubmission.dept_optional_answers?.[i] || <span className="italic text-slate-400">Chưa trả lời</span>}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </>
                );
              })()}

              {/* ── Comments Section ── */}
              <section>
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-slate-900">Nhận xét</h3>
                </div>
                <div className="grid gap-3 lg:grid-cols-3">
                <Card className="rounded-2xl border-slate-200 bg-white shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] text-slate-600">01</span>
                      Ban Thường Vụ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Textarea
                      value={dialogStandingComment}
                      onChange={(e) => setDialogStandingComment(e.target.value)}
                      placeholder="Nhập nhận xét..."
                      rows={5}
                      className="resize-none rounded-xl border-slate-200 bg-slate-50 focus-visible:border-slate-400 focus-visible:ring-slate-200"
                    />
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-slate-200 bg-white shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] text-slate-600">02</span>
                      Ban Chuyên môn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Textarea
                      value={dialogBoardComment}
                      onChange={(e) => setDialogBoardComment(e.target.value)}
                      placeholder="Nhập nhận xét..."
                      rows={5}
                      className="resize-none rounded-xl border-slate-200 bg-slate-50 focus-visible:border-slate-400 focus-visible:ring-slate-200"
                    />
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-slate-200 bg-white shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] text-slate-600">03</span>
                      Dẫn nhóm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Textarea
                      value={dialogTeamLeaderComment}
                      onChange={(e) => setDialogTeamLeaderComment(e.target.value)}
                      placeholder="Nhập nhận xét..."
                      rows={5}
                      className="resize-none rounded-xl border-slate-200 bg-slate-50 focus-visible:border-slate-400 focus-visible:ring-slate-200"
                    />
                  </CardContent>
                </Card>
                </div>
              </section>

              {/* ── Status picker ── */}
              <Card className="rounded-2xl border-slate-200 bg-white shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-900">Trạng thái ứng viên</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(Object.entries(CANDIDATE_STATUS) as [CandidateStatus, typeof CANDIDATE_STATUS[CandidateStatus]][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setDialogStatus(key)}
                        className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                          dialogStatus === key
                            ? `${cfg.btnActive} ring-2 ring-offset-2`
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${cfg.circleColor}`} />
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ── Alerts ── */}
              {saveDetailError && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-0.5" />
                  {saveDetailError}
                </div>
              )}
              {saveDetailSuccess && (
                <div className="bg-green-50 border-l-4 border-green-500 px-4 py-3 rounded-lg text-sm text-green-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-0.5" />
                  Đã lưu thành công!
                </div>
              )}

              {/* ── Action ── */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailSubmission(null);
                    setDetailTemplate(null);
                  }}
                  className="rounded-lg"
                >
                  Đóng
                </Button>
                <Button
                  onClick={saveDetailChanges}
                  disabled={savingDetail}
                  className="rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                  {savingDetail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu…
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel: Function — API connection testing
// ─────────────────────────────────────────────────────────────────────────────

function FunctionPanel({ authHeaders }: { authHeaders: Record<string, string> }) {
  const [statuses, setStatuses] = useState<Record<string, ServiceStatus>>({
    supabase: 'idle', publicApi: 'idle', ai: 'idle', admin: 'idle',
  });
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [pageStatuses, setPageStatuses] = useState<Record<string, ServiceStatus>>({
    home: 'idle', achievements: 'idle', activities: 'idle', apply: 'idle',
    blog: 'idle', structure: 'idle', youth: 'idle', aiPage: 'idle',
  });
  const [pageMessages, setPageMessages] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<Array<{ id: string; label: string; ok: boolean; msg: string; at: string }>>([]);

  const appendLog = (label: string, ok: boolean, msg: string) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      label,
      ok,
      msg,
      at: new Date().toISOString(),
    };
    setLogs((prev) => [entry, ...prev].slice(0, 50));
  };

  const runTest = async (
    key: string,
    label: string,
    fn: () => Promise<{ ok: boolean; msg: string }>,
  ) => {
    setStatuses(s => ({ ...s, [key]: 'loading' }));
    try {
      const result = await fn();
      setStatuses(s => ({ ...s, [key]: result.ok ? 'ok' : 'error' }));
      setMessages(m => ({ ...m, [key]: result.msg }));
      appendLog(label, result.ok, result.msg);
    } catch (e) {
      setStatuses(s => ({ ...s, [key]: 'error' }));
      const msg = String(e);
      setMessages(m => ({ ...m, [key]: msg }));
      appendLog(label, false, msg);
    }
  };

  const runPageTest = async (
    key: string,
    label: string,
    fn: () => Promise<{ ok: boolean; msg: string }>,
  ) => {
    setPageStatuses(s => ({ ...s, [key]: 'loading' }));
    try {
      const result = await fn();
      setPageStatuses(s => ({ ...s, [key]: result.ok ? 'ok' : 'error' }));
      setPageMessages(m => ({ ...m, [key]: result.msg }));
      appendLog(label, result.ok, result.msg);
    } catch (e) {
      setPageStatuses(s => ({ ...s, [key]: 'error' }));
      const msg = String(e);
      setPageMessages(m => ({ ...m, [key]: msg }));
      appendLog(label, false, msg);
    }
  };

  const getErrorMessage = async (res: Response): Promise<string> => {
    try {
      const payload = await res.json();
      const detail = payload?.message || payload?.error || payload?.details;
      return detail ? `Lỗi HTTP ${res.status}: ${detail}` : `Lỗi HTTP ${res.status}`;
    } catch {
      return `Lỗi HTTP ${res.status}`;
    }
  };

  const services: {
    key: string;
    icon: LucideIcon;
    label: string;
    desc: string;
    bgColor: string;
    iconColor: string;
    onTest: () => Promise<{ ok: boolean; msg: string }>;
  }[] = [
    {
      key: 'supabase',
      icon: Database,
      label: 'Database',
      desc: 'Kiểm tra kết nối cơ sở dữ liệu',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      onTest: async () => {
        const res = await fetch('/api/admin/health', { headers: authHeaders, cache: 'no-store' });
        return {
          ok: res.ok,
          msg: res.ok ? 'Kết nối thành công' : await getErrorMessage(res),
        };
      },
    },
    {
      key: 'publicApi',
      icon: Wrench,
      label: 'Public APIs',
      desc: 'Kiểm tra API dữ liệu được các trang công khai sử dụng',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      onTest: async () => {
        const endpoints = ['/api/home-settings', '/api/achievements', '/api/activities', '/api/structure', '/api/youth'];
        const responses = await Promise.all(endpoints.map((endpoint) => fetch(endpoint, { cache: 'no-store' })));
        const failed = responses.findIndex((response) => !response.ok);
        return failed === -1
          ? { ok: true, msg: `${endpoints.length}/${endpoints.length} API công khai phản hồi thành công` }
          : { ok: false, msg: `${endpoints[failed]} trả về HTTP ${responses[failed].status}` };
      },
    },
    {
      key: 'ai',
      icon: Bot,
      label: 'AI Api',
      desc: 'Kiểm tra kết nối dịch vụ AI Gemini',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
      onTest: async () => {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'ping' }),
        });
        return {
          ok: res.ok,
          msg: res.ok ? 'AI đang hoạt động bình thường' : await getErrorMessage(res),
        };
      },
    },
    {
      key: 'admin',
      icon: ShieldCheck,
      label: 'Admin API',
      desc: 'Kiểm tra xác thực Admin API',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      onTest: async () => {
        const res = await fetch('/api/admin/home-settings', { headers: authHeaders });
        return {
          ok: res.ok,
          msg: res.ok ? 'Admin API xác thực thành công' : await getErrorMessage(res),
        };
      },
    },
  ];

  const pageChecks: {
    key: string;
    label: string;
    desc: string;
    path: string;
    apiPath?: string;
  }[] = [
    { key: 'home', label: 'Trang chủ', desc: 'Trang và dữ liệu video', path: '/', apiPath: '/api/home-settings' },
    { key: 'achievements', label: 'Thành tích', desc: 'Trang và dữ liệu thành tích', path: '/achievements', apiPath: '/api/achievements' },
    { key: 'activities', label: 'Hoạt động', desc: 'Trang và dữ liệu hoạt động', path: '/activities', apiPath: '/api/activities' },
    { key: 'apply', label: 'Đơn đăng ký', desc: 'Trang và biểu mẫu đang mở', path: '/apply', apiPath: '/api/forms/active' },
    { key: 'blog', label: 'Diễn đàn', desc: 'Trang và dữ liệu góc chia sẻ', path: '/blog', apiPath: '/api/blog/testimonials' },
    { key: 'structure', label: 'Cơ cấu', desc: 'Trang và dữ liệu cơ cấu', path: '/structure', apiPath: '/api/structure' },
    { key: 'youth', label: 'Tuổi trẻ', desc: 'Trang và dữ liệu Tuổi trẻ', path: '/youth', apiPath: '/api/youth' },
    { key: 'aiPage', label: 'AI', desc: 'Trang khác: AI', path: '/ai' },
  ];

  const testPageConnection = async (page: typeof pageChecks[number]) => {
    const [pageResponse, apiResponse] = await Promise.all([
      fetch(page.path, { cache: 'no-store' }),
      page.apiPath ? fetch(page.apiPath, { cache: 'no-store' }) : Promise.resolve(null),
    ]);
    if (!pageResponse.ok) return { ok: false, msg: `Trang ${page.path} trả về HTTP ${pageResponse.status}` };
    if (apiResponse && !apiResponse.ok) return { ok: false, msg: `${page.apiPath} trả về HTTP ${apiResponse.status}` };

    if (apiResponse) {
      try {
        await apiResponse.json();
      } catch {
        return { ok: false, msg: `${page.apiPath} không trả về dữ liệu JSON hợp lệ` };
      }
    }

    return {
      ok: true,
      msg: page.apiPath
        ? `Trang ${page.path} và nguồn dữ liệu ${page.apiPath} đều hoạt động`
        : `Trang ${page.path} hoạt động`,
    };
  };

  const testAll = () => {
    services.forEach((svc) => runTest(svc.key, svc.label, svc.onTest));
    pageChecks.forEach((page) => runPageTest(page.key, page.label, () => testPageConnection(page)));
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800"></h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setLogs([])} variant="outline" size="sm" disabled={logs.length === 0}>
            Xóa log
          </Button>
          <Button onClick={testAll} variant="outline" size="sm">
            <Wrench className="w-4 h-4 mr-2" />
            Test tất cả
          </Button>
        </div>
      </div>

      <h2 className="text-base font-semibold text-slate-700 mb-3">Kiểm tra kết nối API</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {services.map(({ key, icon: Icon, label, desc, bgColor, iconColor, onTest }) => (
          <Card key={key}>
            <CardContent className="pt-5">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-medium text-slate-800">{label}</p>
                    <StatusBadge status={statuses[key] as ServiceStatus} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  {messages[key] && (
                    <p className={`text-xs mt-2 ${statuses[key] === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                      {messages[key]}
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    disabled={statuses[key] === 'loading'}
                    onClick={() => runTest(key, label, onTest)}
                  >
                    {statuses[key] === 'loading'
                      ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Đang kiểm tra…</>
                      : 'Kiểm tra'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-base font-semibold text-slate-700 mb-3">Kiểm tra kết nối từng Page</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {pageChecks.map((page) => (
            <Card key={page.key}>
              <CardContent className="pt-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100">
                    <ExternalLink className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-medium text-slate-800">{page.label}</p>
                      <StatusBadge status={pageStatuses[page.key] as ServiceStatus} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{page.desc}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {page.path}{page.apiPath ? ` ↔ ${page.apiPath}` : ''}
                    </p>
                    {pageMessages[page.key] && (
                      <p className={`text-xs mt-2 ${pageStatuses[page.key] === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                        {pageMessages[page.key]}
                      </p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      disabled={pageStatuses[page.key] === 'loading'}
                      onClick={() => runPageTest(page.key, page.label, () => testPageConnection(page))}
                    >
                      {pageStatuses[page.key] === 'loading'
                        ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Đang kiểm tra…</>
                        : 'Kiểm tra'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Log kiểm thử kết nối</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có log. Hãy chạy kiểm tra để xem kết quả theo từng trang và dịch vụ.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {logs.map((item) => (
                <div key={item.id} className="rounded-lg border px-3 py-2 text-sm bg-slate-50">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-800">{item.label}</p>
                    <span className={item.ok ? 'text-green-600 text-xs font-semibold' : 'text-red-600 text-xs font-semibold'}>
                      {item.ok ? 'SUCCESS' : 'ERROR'}
                    </span>
                  </div>
                  <p className={item.ok ? 'text-green-700 text-xs mt-1' : 'text-red-700 text-xs mt-1'}>{item.msg}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{formatDateTime(item.at)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SchemaPanel({ authHeaders }: { authHeaders: Record<string, string> }) {
  return (
    <div>
      <SchemaVisualizerCard authHeaders={authHeaders} />
    </div>
  );
}

function SchemaVisualizerCard({ authHeaders }: { authHeaders: Record<string, string> }) {
  type SchemaField = {
    name: string;
    type: string;
    isPrimary: boolean;
    isForeign: boolean;
  };

  type SchemaTable = {
    name: string;
    fields: SchemaField[];
  };

  type SchemaEdge = {
    fromTable: string;
    fromColumn: string;
    toTable: string;
    toColumn: string;
  };

  type SchemaPayload = {
    tables: SchemaTable[];
    edges: SchemaEdge[];
  };

  type VisualNode = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    subtitle: string;
    fields: SchemaField[];
    fieldIndex: Record<string, number>;
  };

  const [schema, setSchema] = useState<SchemaPayload | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSchema = async () => {
      setLoadingSchema(true);
      setSchemaError(null);

      try {
        const res = await fetch('/api/admin/schema-visualizer', {
          headers: authHeaders,
          cache: 'no-store',
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || `Lỗi HTTP ${res.status}`);
        }

        const payload = await res.json();
        if (!cancelled) {
          setSchema(payload?.data || { tables: [], edges: [] });
        }
      } catch (error) {
        if (!cancelled) {
          setSchemaError(String(error));
        }
      } finally {
        if (!cancelled) {
          setLoadingSchema(false);
        }
      }
    };

    fetchSchema();

    return () => {
      cancelled = true;
    };
  }, [authHeaders, refreshKey]);

  const visual = useMemo(() => {
    const tables = schema?.tables || [];
    const edges = schema?.edges || [];

    if (!tables.length) {
      return {
        nodes: [] as VisualNode[],
        edges,
        width: 1240,
        height: 560,
      };
    }

    const refsByTable = new Map<string, Set<string>>();
    for (const table of tables) {
      refsByTable.set(table.name, new Set());
    }
    for (const edge of edges) {
      if (!refsByTable.has(edge.fromTable)) refsByTable.set(edge.fromTable, new Set());
      if (edge.fromTable !== edge.toTable) {
        refsByTable.get(edge.fromTable)!.add(edge.toTable);
      }
    }

    const levelCache = new Map<string, number>();
    const visiting = new Set<string>();

    const getLevel = (tableName: string): number => {
      if (levelCache.has(tableName)) return levelCache.get(tableName)!;
      if (visiting.has(tableName)) return 0;

      visiting.add(tableName);
      const refs = Array.from(refsByTable.get(tableName) || []);
      const level = refs.length ? Math.max(...refs.map((ref) => getLevel(ref) + 1)) : 0;
      visiting.delete(tableName);
      levelCache.set(tableName, level);

      return level;
    };

    const groups = new Map<number, SchemaTable[]>();
    for (const table of tables) {
      const lvl = getLevel(table.name);
      if (!groups.has(lvl)) groups.set(lvl, []);
      groups.get(lvl)!.push(table);
    }

    const xPadding = 36;
    const yPadding = 28;
    const columnGap = 420;
    const rowGap = 26;

    const nodes: VisualNode[] = [];

    const sortedLevels = Array.from(groups.keys()).sort((a, b) => a - b);
    for (const lvl of sortedLevels) {
      const group = [...(groups.get(lvl) || [])].sort((a, b) => a.name.localeCompare(b.name));
      let currentY = yPadding;

      for (const table of group) {
        const width = 344;
        const height = Math.max(104, 56 + table.fields.length * 24);
        const fieldIndex: Record<string, number> = {};
        table.fields.forEach((f, idx) => {
          fieldIndex[f.name] = idx;
        });

        nodes.push({
          id: table.name,
          x: xPadding + lvl * columnGap,
          y: currentY,
          width,
          height,
          title: table.name,
          subtitle: `${table.fields.length} thuộc tính`,
          fields: table.fields,
          fieldIndex,
        });

        currentY += height + rowGap;
      }
    }

    const width = Math.max(1240, ...nodes.map((n) => n.x + n.width + 42));
    const height = Math.max(560, ...nodes.map((n) => n.y + n.height + 32));

    return { nodes, edges, width, height };
  }, [schema]);

  const positionedNodes = useMemo(() => {
    return visual.nodes.map((node) => {
      const movedPos = nodePositions[node.id];
      return movedPos ? { ...node, x: movedPos.x, y: movedPos.y } : node;
    });
  }, [visual.nodes, nodePositions]);

  const nodeMap = useMemo(() => {
    const map: Record<string, (typeof visual.nodes)[number]> = {};
    for (const node of positionedNodes) {
      map[node.id] = node;
    }
    return map;
  }, [positionedNodes]);

  useEffect(() => {
    setNodePositions((prev) => {
      const next: Record<string, { x: number; y: number }> = {};
      for (const node of visual.nodes) {
        next[node.id] = prev[node.id] || { x: node.x, y: node.y };
      }
      return next;
    });
  }, [visual.nodes]);

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const baseNode = visual.nodes.find((node) => node.id === dragState.id);
      if (!baseNode) return;

      const rawX = event.clientX - rect.left - dragState.offsetX;
      const rawY = event.clientY - rect.top - dragState.offsetY;

      const maxX = Math.max(8, visual.width - baseNode.width - 8);
      const maxY = Math.max(8, visual.height - baseNode.height - 8);

      setNodePositions((prev) => ({
        ...prev,
        [dragState.id]: {
          x: Math.max(8, Math.min(maxX, rawX)),
          y: Math.max(8, Math.min(maxY, rawY)),
        },
      }));
    };

    const handlePointerUp = () => {
      setDragState(null);
      setDraggingNodeId(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, visual]);

  const handleStartDragNode = (event: React.PointerEvent<HTMLDivElement>, nodeId: string) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const node = nodeMap[nodeId];
    if (!rect || !node) return;

    setDraggingNodeId(nodeId);
    setDragState({
      id: nodeId,
      offsetX: event.clientX - rect.left - node.x,
      offsetY: event.clientY - rect.top - node.y,
    });

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignore; dragging still handled through window listeners.
    }
  };

  const orthogonalPath = (edge: SchemaEdge) => {
    const source = nodeMap[edge.fromTable];
    const target = nodeMap[edge.toTable];

    if (!source || !target) {
      return { path: '' };
    }

    const fromIndex = source.fieldIndex[edge.fromColumn] ?? 0;
    const toIndex = target.fieldIndex[edge.toColumn] ?? 0;
    const sourceY = source.y + 56 + fromIndex * 24;
    const targetY = target.y + 56 + toIndex * 24;

    if (source.id === target.id) {
      const sourceX = source.x + source.width;
      const loopX = source.x + source.width + 42;
      const loopY = source.y + 24;
      return {
        path: `M ${sourceX} ${sourceY} L ${loopX} ${sourceY} L ${loopX} ${loopY} L ${source.x + source.width - 8} ${loopY}`,
      };
    }

    const sourceCenterX = source.x + source.width / 2;
    const targetCenterX = target.x + target.width / 2;
    const exitsFromRight = targetCenterX >= sourceCenterX;

    // Attach exactly on the nearest vertical border and flip side when tables cross.
    const sourceX = exitsFromRight ? source.x + source.width : source.x;
    const targetX = exitsFromRight ? target.x : target.x + target.width;

    const minGap = 28;
    const midX = exitsFromRight
      ? Math.max(sourceX + minGap, targetX - minGap)
      : Math.min(sourceX - minGap, targetX + minGap);

    return {
      path: `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`,
    };
  };

  return (
    <Card className="mt-6 border-slate-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">

            <Button
              size="sm"
              variant="outline"
              onClick={() => setRefreshKey((v) => v + 1)}
              disabled={loadingSchema}
              className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              {loadingSchema ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Đang tải…</> : 'Làm mới sơ đồ'}
            </Button>
            <div className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              <span className="text-[11px] leading-none text-[#d97706]">♦</span>
              PK
              <span className="ml-1 text-[11px] leading-none text-[#0ea5e9]">♦</span>
              FK
            </div>

          </div>
        </div>
      </CardHeader>
      <CardContent>
        {schemaError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Không tải được schema: {schemaError}
          </div>
        ) : null}

        <div className="relative overflow-auto rounded-md border border-slate-100 bg-slate-50/70 p-3 [background-image:radial-gradient(#dbe5f2_1px,transparent_0)] [background-size:18px_18px]">
          <div ref={canvasRef} className="relative" style={{ minWidth: `${visual.width}px`, minHeight: `${visual.height}px` }}>
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox={`0 0 ${visual.width} ${visual.height}`}
              preserveAspectRatio="none"
            >
              <defs>
                <marker id="erdArrowDynamic" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <path d="M 0 0 L 8 3 L 0 6 z" fill="#64748b" />
                </marker>
              </defs>

              {visual.edges.map((edge) => {
                const segment = orthogonalPath(edge);
                if (!segment.path) return null;

                return (
                  <g key={`${edge.fromTable}.${edge.fromColumn}-${edge.toTable}.${edge.toColumn}`}>
                    <path
                      d={segment.path}
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                      markerEnd="url(#erdArrowDynamic)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                );
              })}
            </svg>

            {positionedNodes.map((node) => (
              <div
                key={node.id}
                className={`absolute rounded-[8px] border border-slate-200 bg-white/95 shadow-sm ${draggingNodeId === node.id ? 'z-20' : 'z-10'}`}
                style={{ left: node.x, top: node.y, width: node.width }}
              >
                <div
                  onPointerDown={(event) => handleStartDragNode(event, node.id)}
                  className="flex min-h-[44px] cursor-grab flex-col justify-center rounded-t-[8px] border-b border-slate-100 bg-slate-50 px-2.5 py-1.5 active:cursor-grabbing"
                >
                  <p className="truncate text-left text-[12px] font-semibold text-slate-700">{node.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{node.subtitle}</p>
                </div>

                <div className="p-2.5 pt-2">
                  <div className="overflow-hidden rounded-md border border-slate-100">
                    <div className="divide-y divide-slate-100/80">
                      {node.fields.map((field) => (
                        <div key={`${node.id}-${field.name}`} className="relative grid grid-cols-[1.35fr_1fr] items-center gap-2 px-2 py-1.5 pr-6 text-[11px] text-slate-600">
                          <span className="truncate text-left">{field.name}</span>
                          <span className="truncate text-right text-slate-400">{field.type}</span>
                          <span className="pointer-events-none absolute -right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-[11px] leading-none">
                            {field.isPrimary ? (
                              <span className="text-[#d97706]">♦</span>
                            ) : null}
                            {field.isForeign ? (
                              <span className="text-[#0ea5e9]">♦</span>
                            ) : null}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb helper
// ─────────────────────────────────────────────────────────────────────────────

function Breadcrumb({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-1">
      <FolderOpen className="w-3.5 h-3.5" />
      <span>Danh mục trang</span>
      <ChevronRight className="w-3 h-3" />
      <span className="text-slate-600 font-medium">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel: Category — Home
// ─────────────────────────────────────────────────────────────────────────────

function CategoryHomePanel({ authHeaders }: { authHeaders: Record<string, string> }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<'1' | '2' | '3' | 'banner' | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imageFiles, setImageFiles] = useState<{ banner: File | null; one: File | null; two: File | null; three: File | null }>({
    banner: null,
    one: null,
    two: null,
    three: null,
  });
  const [settings, setSettings] = useState({
    homeBannerImage: '',
    homeImageOne: '',
    homeImageTwo: '',
    homeImageThree: '',
    youtubeVideoUrl: '',
  });

  const handleSelectImageFile = (slot: '1' | '2' | '3' | 'banner', file: File | null) => {
    setImageFiles((prev) => ({
      ...prev,
      ...(slot === 'banner' ? { banner: file } : {}),
      ...(slot === '1' ? { one: file } : {}),
      ...(slot === '2' ? { two: file } : {}),
      ...(slot === '3' ? { three: file } : {}),
    }));
  };

  useEffect(() => {
    let mounted = true;

    const loadHomeSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/home-settings', { headers: authHeaders });
        if (!res.ok) throw new Error('Không thể tải dữ liệu trang chủ');

        const data = await res.json();
        if (!mounted) return;

        setSettings((prev) => ({
          ...prev,
          homeBannerImage: data.homeBannerImage ?? prev.homeBannerImage,
          homeImageOne: data.homeImageOne ?? prev.homeImageOne,
          homeImageTwo: data.homeImageTwo ?? prev.homeImageTwo,
          homeImageThree: data.homeImageThree ?? prev.homeImageThree,
          youtubeVideoUrl: data.youtubeVideoUrl ?? prev.youtubeVideoUrl,
        }));
      } catch (error) {
        if (!mounted) return;
        setSaveError(error instanceof Error ? error.message : 'Không thể tải dữ liệu trang chủ');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadHomeSettings();

    return () => {
      mounted = false;
    };
  }, [authHeaders]);

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    const youtubeUrl = settings.youtubeVideoUrl.trim();
    if (youtubeUrl && !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(youtubeUrl)) {
      setSaveError('Vui lòng nhập một đường dẫn YouTube hợp lệ.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/home-settings', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          youtubeVideoUrl: youtubeUrl,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error ? `${payload?.message || 'Lưu cài đặt thất bại'}: ${payload.error}` : (payload?.message || 'Lưu cài đặt thất bại'));
      }

      setSaveSuccess(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Lưu cài đặt thất bại');
    } finally {
      setSaving(false);
    }
  };

  const uploadHomeImage = async (slot: '1' | '2' | '3' | 'banner') => {
    const file = slot === 'banner' ? imageFiles.banner : slot === '1' ? imageFiles.one : slot === '2' ? imageFiles.two : imageFiles.three;
    if (!file) {
      setSaveError(`Vui lòng chọn file cho ảnh ${slot} trước khi upload.`);
      return;
    }

    setSaveError(null);
    setSaveSuccess(false);
    setUploadingSlot(slot);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slot', slot);

      const res = await fetch('/api/admin/home/upload-image', {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || 'Upload ảnh thất bại');
      }

      const imageUrl = String(payload?.data?.imageUrl || '').trim();
      if (!imageUrl) {
        throw new Error('Upload thành công nhưng không nhận được URL ảnh');
      }

      const imageFieldKey =
        slot === 'banner'
          ? 'homeBannerImage'
          : slot === '1'
            ? 'homeImageOne'
            : slot === '2'
              ? 'homeImageTwo'
              : 'homeImageThree';

      const persistRes = await fetch('/api/admin/home-settings', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [imageFieldKey]: imageUrl }),
      });

      if (!persistRes.ok) {
        const persistPayload = await persistRes.json().catch(() => ({}));
        throw new Error(
          persistPayload?.error
            ? `${persistPayload?.message || 'Upload thành công nhưng lưu ảnh vào cài đặt thất bại'}: ${persistPayload.error}`
            : (persistPayload?.message || 'Upload thành công nhưng lưu ảnh vào cài đặt thất bại')
        );
      }

      setSettings((prev) => ({
        ...prev,
        ...(slot === 'banner' ? { homeBannerImage: imageUrl } : {}),
        ...(slot === '1' ? { homeImageOne: imageUrl } : {}),
        ...(slot === '2' ? { homeImageTwo: imageUrl } : {}),
        ...(slot === '3' ? { homeImageThree: imageUrl } : {}),
      }));

      setImageFiles((prev) => ({
        ...prev,
        ...(slot === 'banner' ? { banner: null } : {}),
        ...(slot === '1' ? { one: null } : {}),
        ...(slot === '2' ? { two: null } : {}),
        ...(slot === '3' ? { three: null } : {}),
      }));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Upload ảnh thất bại');
    } finally {
      setUploadingSlot(null);
    }
  };

  return (
    <div>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="">Thay đổi Video hiển thị</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải dữ liệu...
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="home-youtube-url" className="text-sm font-semibold text-slate-700">
                  Đường dẫn YouTube
                </label>
                <Input
                  id="home-youtube-url"
                  type="url"
                  value={settings.youtubeVideoUrl}
                  onChange={(event) => setSettings((previous) => ({ ...previous, youtubeVideoUrl: event.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-slate-500">Hỗ trợ liên kết youtube.com và youtu.be.</p>
              </div>

              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              {saveSuccess && <p className="text-sm text-green-600">Đã cập nhật video trang chủ.</p>}

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? 'Đang lưu...' : 'Lưu đường dẫn video'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="hidden" aria-hidden="true">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cài đặt Giao diện trang chủ</CardTitle>
          <CardDescription className="text-xs italic">Lưu ý: Banner hiển thị full chiều ngang và giữ chiều cao theo tỷ lệ ảnh gốc; Hình phần nội dung là 4:3.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tải dữ liệu...
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <p className="text-sm font-medium text-slate-700">Banner trang chủ</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSelectImageFile('banner', e.target.files?.[0] || null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!imageFiles.banner || uploadingSlot === 'banner'}
                    onClick={() => uploadHomeImage('banner')}
                  >
                    {uploadingSlot === 'banner' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Cập nhật ảnh banner
                  </Button>
                  <p className="text-xs text-slate-500 break-all">{settings.homeBannerImage || 'Chưa có ảnh banner'}</p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-slate-700">Hình 1</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSelectImageFile('1', e.target.files?.[0] || null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!imageFiles.one || uploadingSlot === '1'}
                    onClick={() => uploadHomeImage('1')}
                  >
                    {uploadingSlot === '1' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Nhấn để cập nhật
                  </Button>
                  <p className="text-xs text-slate-500 break-all">{settings.homeImageOne || 'Chưa có ảnh'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-slate-700">Hình 2</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSelectImageFile('2', e.target.files?.[0] || null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!imageFiles.two || uploadingSlot === '2'}
                    onClick={() => uploadHomeImage('2')}
                  >
                    {uploadingSlot === '2' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Nhấn để cập nhật
                  </Button>
                  <p className="text-xs text-slate-500 break-all">{settings.homeImageTwo || 'Chưa có ảnh'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-slate-700">Hình 3</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSelectImageFile('3', e.target.files?.[0] || null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!imageFiles.three || uploadingSlot === '3'}
                    onClick={() => uploadHomeImage('3')}
                  >
                    {uploadingSlot === '3' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Nhấn để cập nhật
                  </Button>
                  <p className="text-xs text-slate-500 break-all">{settings.homeImageThree || 'Chưa có ảnh'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-slate-700">Link YouTube video</p>
                  <Input
                    value={settings.youtubeVideoUrl}
                    onChange={(e) => setSettings((prev) => ({ ...prev, youtubeVideoUrl: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 sm:col-span-3">
                  <p className="text-xs text-slate-500 mb-2">Preview Banner</p>
                  {settings.homeBannerImage?.trim() ? (
                    <div className="rounded-md border border-slate-200 bg-white relative">
                      <img src={settings.homeBannerImage} alt="Home banner preview" className="block w-full h-auto" />
                      <div className="absolute inset-0 bg-black/45" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
                        <p className="text-base md:text-2xl font-semibold tracking-wide">CHAO MUNG DEN VOI</p>
                        <p className="mt-2 text-lg md:text-4xl font-bold">DOAN KHOA TAI CHINH - NGAN HANG</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 w-full rounded-md border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-slate-400">
                      Chưa có ảnh banner
                    </div>
                  )}
                </div>

                {[settings.homeImageOne, settings.homeImageTwo, settings.homeImageThree].map((src, idx) => (
                  <div key={`home-image-preview-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <p className="text-xs text-slate-500 mb-2">Preview Hình {idx + 1}</p>
                    {src?.trim() ? (
                      <div className="aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-white">
                        <img src={src} alt={`Home image ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] w-full rounded-md border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-slate-400">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              {saveSuccess && <p className="text-sm text-green-600">Đã lưu thành công.</p>}

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu cài đặt trang chủ'
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel: Category — Structure
// ─────────────────────────────────────────────────────────────────────────────

function CategoryStructurePanel({ adminPassword }: { adminPassword: string }) {
  return (
    <div>
      <StructureAdmin adminPassword={adminPassword} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel: Category — Achievements
// ─────────────────────────────────────────────────────────────────────────────

function CategoryAchievementsPanel({ adminPassword }: { adminPassword: string }) {
  return (
    <div>
      <AchievementsAdmin adminPassword={adminPassword} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel: Category — Activities
// ─────────────────────────────────────────────────────────────────────────────

function CategoryActivitiesPanel({ adminPassword }: { adminPassword: string }) {
  return (
    <div>
      <ActivitiesAdmin adminPassword={adminPassword} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel: Category — Youth
// ─────────────────────────────────────────────────────────────────────────────

function CategoryYouthPanel({ adminPassword }: { adminPassword: string }) {
  return (
    <div>
      <YouthAdmin adminPassword={adminPassword} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel: Category — Student Info
// ─────────────────────────────────────────────────────────────────────────────

function CategoryStudentInfoPanel() {
  return (
    <div>
      <Card className="border-slate-100 bg-white shadow-sm">
        <CardContent className="p-10 flex flex-col items-center justify-center text-center gap-3">
          <GraduationCap className="w-12 h-12 text-slate-300" />
          <p className="text-slate-700 font-medium">Tính năng đang được phát triển</p>
          <p className="text-sm text-slate-400 max-w-sm">
            Cấu trúc dữ liệu cho mục Thông tin sinh viên (lớp, cố vấn, tra cứu sinh viên)
            sẽ được hoàn thiện trong thời gian tới.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryYouthSchoolMapPanel({ adminPassword }: { adminPassword: string }) {
  return (
    <div>
      <SchoolMapAdmin adminPassword={adminPassword} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel: Category Partners
// ─────────────────────────────────────────────────────────────────────────────

function CategoryPartnersPanel({ adminPassword }: { adminPassword: string }) {
  return (
    <div>
      <PartnersAdmin adminPassword={adminPassword} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel: Category Blog Testimonials
// ─────────────────────────────────────────────────────────────────────────────

function CategoryBlogTestimonialsPanel({ adminPassword }: { adminPassword: string }) {
  return (
    <div>
      <BlogTestimonialsAdmin adminPassword={adminPassword} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel: Category Blog Discussions
// ─────────────────────────────────────────────────────────────────────────────

function CategoryBlogDiscussionsPanel({ adminPassword }: { adminPassword: string }) {
  return (
    <div>
      <BlogDiscussionAdmin adminPassword={adminPassword} />
    </div>
  );
}

function ForumManagementPanel({ adminPassword }: { adminPassword: string }) {
  return (
    <Tabs defaultValue="testimonials" className="space-y-6">
      <TabsList className="grid h-auto w-full max-w-xl grid-cols-2 rounded-xl bg-slate-200/70 p-1.5">
        <TabsTrigger
          value="testimonials"
          className="rounded-lg px-4 py-2.5 font-semibold data-[state=active]:text-[#144E8C]"
        >
          Duyệt lời chia sẻ
        </TabsTrigger>
        <TabsTrigger
          value="comments"
          className="rounded-lg px-4 py-2.5 font-semibold data-[state=active]:text-[#144E8C]"
        >
          Quản lý bình luận
        </TabsTrigger>
      </TabsList>
      <TabsContent value="testimonials" className="mt-0">
        <CategoryBlogTestimonialsPanel adminPassword={adminPassword} />
      </TabsContent>
      <TabsContent value="comments" className="mt-0">
        <CategoryBlogDiscussionsPanel adminPassword={adminPassword} />
      </TabsContent>
    </Tabs>
  );
}
