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
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự." }),
  comment: z.string().min(5, { message: "Bình luận phải có ít nhất 5 ký tự." }),
});

export type CommentFormState = {
  message: string;
  isSafe?: boolean;
  reason?: string;
  fields?: Record<string, string>;
  issues?: string[];
} | null;

export type Comment = {
  id: number;
  name: string;
  comment: string;
  avatar: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const ApplicationFormSchema = z.object({
    fullName: z.string().min(2, "Họ và tên là bắt buộc."),
    email: z.string().email("Địa chỉ email không hợp lệ."),
    phone: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ."),
    facebookLink: z.string().url("Link Facebook không hợp lệ."),
    portraitPhoto: z.any().optional(),
    reason: z.string().min(20, "Vui lòng cho chúng tôi biết lý do bạn muốn ứng tuyển (ít nhất 20 ký tự)."),
    expectation: z.string().min(20, "Vui lòng chia sẻ mong muốn của bạn (ít nhất 20 ký tự)."),
    situation: z.string().min(20, "Vui lòng trả lời câu hỏi tình huống (ít nhất 20 ký tự)."),
    department: z.enum(["Tổ chức - Xây dựng", "Tuyên truyền - Sự kiện", "Truyền thông - Kỹ thuật", "Phong trào - Tình nguyện"], {
        errorMap: () => ({ message: "Vui lòng chọn một ban chuyên môn." }),
    }),
});

export type ApplicationFormState = {
    message: string;
    issues?: string[];
    fields?: Record<string, string>;
    analysis?: string;
    sheetUrl?: string;
} | null;
