import { z } from 'zod';

export const ContactFormSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự." }),
  email: z.string().email({ message: "Vui lòng nhập một địa chỉ email hợp lệ." }),
  message: z.string().min(10, { message: "Tin nhắn phải có ít nhất 10 ký tự." }),
});

export type ContactFormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
} | null;


export const CommentFormSchema = z.object({
  name: z.string().optional().nullable(),
  comment: z.string().min(5, { message: "Bình luận phải có ít nhất 5 ký tự." }),
  parentId: z.string().optional().nullable(),
  isAnonymous: z.boolean().default(false),
});

export type CommentFormState = {
  message: string;
  isSafe?: boolean;
  reason?: string;
  fields?: Record<string, string>;
  issues?: string[];
} | null;

export type Comment = {
  id: string;
  name: string | null;
  comment: string;
  avatar: string | null;
  isAnonymous: boolean;
  createdAt: string;
  parentId: string | null;
  replies?: Comment[];
};

// Raw comment type from Supabase
export type SupabaseComment = {
  id: string;
  name: string | null;
  comment: string;
  avatar: string | null;
  is_anonymous: boolean;
  created_at: string;
  parent_id: string | null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const ApplicationFormSchema = z.object({
  // I. Thông tin chung
  fullName: z.string().min(2, ""),
  birthDate: z.string().min(1, ""),
  gender: z.enum(["Nam", "Nữ", "Khác"], { errorMap: () => ({ message: "" }) }),
  studentId: z.string().min(1, ""),
  className: z.string().min(1, ""),
  schoolEmail: z.string().email("Email trường không hợp lệ."),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ."),
  facebookLink: z.string().url("Link Facebook không hợp lệ."),
  currentAddress: z.string().min(1, ""),
  transport: z.string().min(1, ""),
  healthIssues: z.string().optional(),
  strengthsWeaknesses: z.string().min(1, ""),
  specialSkills: z.string().min(1, ""),
  portraitPhoto: z.any().optional(),

  // II. Câu hỏi về Đoàn Khoa
  impression: z.string().min(1, ""),
  experience: z.string().min(1, ""),
  extrovert: z.string().min(1, ""),
  teamwork: z.string().min(1, ""),

  // III. Chọn ban
  department: z.enum(
    [
      "Truyền thông - Kỹ thuật",
      "Tuyên giáo - Sự kiện",
      "Tổ chức - Xây dựng Đoàn",
      "Phong trào - Tình nguyện",
    ],
    { errorMap: () => ({ message: "" }) }
  ),

  // Câu hỏi chuyên môn theo ban (ẩn/hiện sau khi chọn ban)
  deptQuestion1: z.string().min(1, ""),
  deptQuestion2: z.string().min(1, ""),
});

export type ApplicationFormState = {
    message: string;
    issues?: string[];
    fields?: Record<string, string>;
    analysis?: string;
    sheetUrl?: string;
} | null;
