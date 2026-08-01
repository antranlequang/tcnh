"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, Plus, Send, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TestimonialSubmissionForm() {
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);

  const previewUrls = useMemo(() => images.map((image) => URL.createObjectURL(image)), [images]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, [previewUrls]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitted(false);

    if (!fullName.trim() || !message.trim()) {
      setError("Vui lòng nhập họ tên và lời gửi gắm.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("position", position.trim());
      formData.append("message", message.trim());
      images.forEach((image) => formData.append("images", image));

      const response = await fetch("/api/blog/testimonials", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Không thể gửi lời chúc.");
      }

      setFullName("");
      setPosition("");
      setMessage("");
      setImages([]);
      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Không thể gửi lời chúc.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          setError(null);
          setSubmitted(false);
          setOpen(true);
        }}
        className="h-11 rounded-full bg-[#144E8C] px-4 text-white shadow-md hover:bg-[#F05A23]"
        aria-label="Thêm lời chia sẻ"
        title="Thêm lời chia sẻ"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">Đăng bài</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm lời chia sẻ</DialogTitle>
            <DialogDescription>
              Nội dung sẽ được hiển thị sau khi quản trị viên phê duyệt.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4">
            {submitted && (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">
                <AlertDescription>Đã gửi thành công. Bài viết đang chờ quản trị viên phê duyệt.</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="testimonial-name" className="mb-2 block text-sm font-semibold text-slate-700">
                  Họ và tên
                </label>
                <Input id="testimonial-name" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={120} placeholder="Nguyễn Văn A" required />
              </div>
              <div>
                <label htmlFor="testimonial-position" className="mb-2 block text-sm font-semibold text-slate-700">
                  Chức vụ (nếu có)
                </label>
                <Input id="testimonial-position" value={position} onChange={(event) => setPosition(event.target.value)} maxLength={160} placeholder="Không bắt buộc" />
              </div>
            </div>

            <div>
              <label htmlFor="testimonial-message" className="mb-2 block text-sm font-semibold text-slate-700">
                Lời chia sẻ
              </label>
              <Textarea id="testimonial-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} rows={5} placeholder="Chia sẻ câu chuyện của bạn..." required />
            </div>

            <div>
              <label htmlFor="testimonial-image" className="mb-2 block text-sm font-semibold text-slate-700">
                Hình ảnh <span className="font-normal text-slate-400">(không bắt buộc)</span>
              </label>
              <Input
                id="testimonial-image"
                type="file"
                multiple
                accept="image/*,.heic,.heif"
                onChange={(event) => setImages(Array.from(event.target.files || []).slice(0, 10))}
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Tối đa 10 hình; hỗ trợ mọi định dạng ảnh, bao gồm HEIC/HEIF, không giới hạn dung lượng.
              </p>

              {previewUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {previewUrls.map((previewUrl, index) => (
                    <div key={previewUrl} className="relative aspect-square overflow-hidden rounded-xl border bg-slate-50">
                      <img src={previewUrl} alt={`Xem trước hình ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/65 text-white"
                        aria-label={`Bỏ hình ${index + 1}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={submitting} className="bg-[#144E8C] text-white hover:bg-[#F05A23]">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : images.length > 0 ? <ImagePlus className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                {submitting ? "Đang gửi..." : "Gửi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
