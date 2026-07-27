"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import type { AlumniTestimonialRow } from "@/lib/blog";
import { Button } from "@/components/ui/button";

const TESTIMONIALS_PER_PAGE = 5;

function TestimonialPost({ item }: { item: AlumniTestimonialRow }) {
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const images = item.image_urls || [];
  const hasImages = images.length > 0;
  const initials = item.full_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const showPrevious = () => {
    setActiveImage((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const showNext = () => {
    setActiveImage((current) => (current + 1) % images.length);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.07)]">
      <header className="flex items-center gap-3 px-4 py-3">
        <div className="rounded-full bg-gradient-to-tr from-[#F05A23] via-pink-500 to-violet-600 p-[2px]">
          <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#144E8C] text-xs font-bold text-white">
            {initials || "DK"}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{item.full_name}</p>
          {item.positions.length > 0 && (
            <p className="truncate text-xs text-slate-500">{item.positions.join(" · ")}</p>
          )}
        </div>
        <MoreHorizontal className="h-5 w-5 text-slate-500" aria-hidden="true" />
      </header>

      {hasImages && (
        <div className="relative aspect-square overflow-hidden bg-black">
          <img
            src={images[activeImage]}
            alt={`Bài chia sẻ của ${item.full_name}, hình ${activeImage + 1}`}
            className="h-full w-full object-cover"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                aria-label="Xem hình trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                aria-label="Xem hình tiếp theo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                {activeImage + 1}/{images.length}
              </span>
            </>
          )}
        </div>
      )}

      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setLiked((current) => !current)}
            className={liked ? "text-red-500" : "text-slate-900 hover:text-slate-500"}
            aria-label={liked ? "Bỏ thích bài viết" : "Thích bài viết"}
          >
            <Heart className="h-6 w-6" fill={liked ? "currentColor" : "none"} />
          </button>
          <MessageCircle className="h-6 w-6 text-slate-900" aria-hidden="true" />
          <Send className="h-6 w-6 text-slate-900" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setSaved((current) => !current)}
            className="ml-auto text-slate-900 hover:text-slate-500"
            aria-label={saved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
          >
            <Bookmark className="h-6 w-6" fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        {images.length > 1 && (
          <div className="-mt-4 flex justify-center gap-1.5" aria-label={`Hình ${activeImage + 1} trên ${images.length}`}>
            {images.map((_, index) => (
              <button
                key={`${item.id}-dot-${index}`}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeImage ? "w-4 bg-[#144E8C]" : "w-1.5 bg-slate-300"
                }`}
                aria-label={`Xem hình ${index + 1}`}
              />
            ))}
          </div>
        )}

        <p className={`whitespace-pre-wrap text-sm leading-6 text-slate-800 ${hasImages ? "mt-4" : "mt-5 text-base leading-7"}`}>
          <span className="mr-2 font-bold text-slate-950">{item.full_name}</span>
          {item.message}
        </p>
        <time className="mt-3 block text-[11px] uppercase tracking-wide text-slate-400" dateTime={item.created_at}>
          {new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }).format(new Date(item.created_at))}
        </time>
      </div>
    </article>
  );
}

export function TestimonialsSection() {
  const [rows, setRows] = useState<AlumniTestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/api/blog/testimonials", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.message || "Không tải được lời gửi gắm.");
        setRows(Array.isArray(payload?.data) ? payload.data : []);
      })
      .catch((error) => {
        console.error(error);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / TESTIMONIALS_PER_PAGE));
  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * TESTIMONIALS_PER_PAGE;
    return rows.slice(start, start + TESTIMONIALS_PER_PAGE);
  }, [currentPage, rows]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  if (loading) {
    return <p className="text-center text-sm text-muted-foreground">Đang tải lời gửi gắm...</p>;
  }

  if (rows.length === 0) {
    return <p className="text-center text-sm text-muted-foreground">Bạn hãy là người đầu tiên chia sẻ cảm nghĩ của mình nào...</p>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {visibleRows.map((item) => (
        <TestimonialPost key={item.id} item={item} />
      ))}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-2" aria-label="Phân trang góc chia sẻ">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            aria-label="Trang chia sẻ trước"
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>
          <span className="min-w-20 text-center text-sm font-medium text-slate-600">
            {currentPage} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            aria-label="Trang chia sẻ tiếp theo"
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
