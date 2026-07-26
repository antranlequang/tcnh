"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, EyeOff, GripVertical, Images, Trash2 } from "lucide-react";
import type { AlumniTestimonialRow } from "@/lib/blog";

export function BlogTestimonialsAdmin({ adminPassword }: { adminPassword: string }) {
  const [rows, setRows] = useState<AlumniTestimonialRow[]>([]);
  const [dragOrder, setDragOrder] = useState<AlumniTestimonialRow[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useMemo(() => ({ "x-admin-password": adminPassword }), [adminPassword]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/blog/testimonials", { headers: authHeaders });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Không tải được dữ liệu.");

      const data = Array.isArray(payload?.data) ? payload.data : [];
      setRows(data);
      setDragOrder(data);
      setOrderChanged(false);
    } catch (refreshError) {
      setError(String(refreshError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa lời chia sẻ này?")) return;

    setError(null);
    try {
      const response = await fetch(`/api/admin/blog/testimonials/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Không xóa được dữ liệu.");
      await refresh();
    } catch (removeError) {
      setError(String(removeError));
    }
  };

  const togglePublication = async (id: string, isPublished: boolean) => {
    setError(null);
    try {
      const response = await fetch(`/api/admin/blog/testimonials/${id}`, {
        method: "PATCH",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Không cập nhật được trạng thái duyệt.");
      await refresh();
    } catch (updateError) {
      setError(String(updateError));
    }
  };

  const handleDrop = (event: React.DragEvent, targetId: string) => {
    event.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = dragOrder.findIndex((row) => row.id === draggedId);
    const targetIndex = dragOrder.findIndex((row) => row.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const nextOrder = [...dragOrder];
    const [draggedItem] = nextOrder.splice(draggedIndex, 1);
    nextOrder.splice(targetIndex, 0, draggedItem);
    setDragOrder(nextOrder);
    setDraggedId(null);
    setOrderChanged(true);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/blog/testimonials", {
        method: "PATCH",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(dragOrder.map((item) => ({ id: item.id }))),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Không lưu được thứ tự.");
      await refresh();
    } catch (orderError) {
      setError(String(orderError));
    } finally {
      setSavingOrder(false);
    }
  };

  const pendingCount = rows.filter((row) => !row.is_published).length;

  return (
    <div className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <CardTitle>Duyệt lời chia sẻ</CardTitle>
              {pendingCount > 0 && <Badge variant="secondary">{pendingCount} chờ duyệt</Badge>}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Bài được gửi từ website chính. Admin chỉ duyệt, ẩn, sắp xếp hoặc xóa nội dung.
            </p>
          </div>
          <div className="flex gap-2">
            {orderChanged && (
              <Button type="button" onClick={saveOrder} disabled={savingOrder}>
                {savingOrder ? "Đang lưu..." : "Lưu thứ tự"}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={refresh} disabled={loading}>
              {loading ? "Đang tải..." : "Tải lại"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {dragOrder.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Chưa có lời chia sẻ nào được gửi.</p>
          ) : (
            <div className="space-y-3">
              {dragOrder.map((row) => (
                <div
                  key={row.id}
                  draggable
                  onDragStart={(event) => {
                    setDraggedId(row.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, row.id)}
                  onDragEnd={() => setDraggedId(null)}
                  className={`rounded-xl border p-4 transition ${
                    draggedId === row.id ? "border-[#144E8C]/30 bg-blue-50/70 opacity-60" : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <GripVertical className="mt-1 h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                    {row.image_urls?.[0] && (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <img src={row.image_urls[0]} alt="" className="h-full w-full object-cover" />
                        {row.image_urls.length > 1 && (
                          <span className="absolute bottom-1 right-1 flex items-center gap-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] text-white">
                            <Images className="h-3 w-3" />
                            {row.image_urls.length}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{row.full_name}</p>
                        <Badge variant={row.is_published ? "default" : "secondary"}>
                          {row.is_published ? "Đã duyệt" : "Chờ duyệt"}
                        </Badge>
                      </div>
                      {row.positions.length > 0 && (
                        <p className="mt-1 text-xs text-slate-500">{row.positions.join(" · ")}</p>
                      )}
                      <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {row.message}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant={row.is_published ? "outline" : "default"}
                        size="sm"
                        onClick={() => togglePublication(row.id, !row.is_published)}
                      >
                        {row.is_published ? (
                          <><EyeOff className="h-4 w-4" />Ẩn</>
                        ) : (
                          <><CheckCircle2 className="h-4 w-4" />Duyệt</>
                        )}
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => remove(row.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
