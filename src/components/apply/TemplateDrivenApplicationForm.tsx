"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock3, Loader2, Send, Sparkles } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { submitApplication } from "@/app/actions";
import {
  ApplicationFormSubmissionStrictSchema,
  type ApplicationFormState,
} from "@/lib/definitions";
import {
  DEPARTMENTS,
  type Department,
  type IllustrationSlot,
  type ApplicationFormIllustration,
  normalizeTemplateShape,
} from "@/lib/applicationForms";

type ActiveTemplateResponse =
  | {
      success: true;
      status: "active" | "not_started" | "closed";
      now: string;
      template: any;
    }
  | { success: false; message: string };

const initialState: ApplicationFormState = null;

const optionalPersonalKeys = [
  "optionalPersonal1",
  "optionalPersonal2",
  "optionalPersonal3",
  "optionalPersonal4",
  "optionalPersonal5",
] as const;

const deptOptionalKeys = ["deptOptional1", "deptOptional2", "deptOptional3"] as const;

const FIELD_CLASS =
  "h-12 rounded-xl border-slate-200 bg-slate-50/80 px-4 text-slate-800 shadow-none transition-colors placeholder:text-slate-400 focus-visible:border-[#144E8C] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#144E8C]/15 focus-visible:ring-offset-0";
const TEXTAREA_CLASS =
  "rounded-xl border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-800 shadow-none transition-colors placeholder:text-slate-400 focus-visible:border-[#144E8C] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#144E8C]/15 focus-visible:ring-offset-0";
const LABEL_CLASS = "text-sm font-bold text-[#0b3767]";

function formatCountdown(diffMs: number) {
  const diff = Math.max(0, diffMs);
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds };
}

function IllustrationList({ illustrations }: { illustrations: ApplicationFormIllustration[] }) {
  if (illustrations.length === 0) return null;
  const hasSingleIllustration = illustrations.length === 1;

  return (
    <div
      className={
        hasSingleIllustration
          ? "mx-auto grid w-full max-w-4xl gap-4"
          : "grid gap-4 sm:grid-cols-2"
      }
    >
      {illustrations.map((img) => (
        <figure
          key={img.id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(11,55,103,0.10)]"
        >
          {/* External images from Supabase/public URLs => use plain <img> */}
          <img
            src={img.url}
            alt={img.title || "illustration"}
            className={
              hasSingleIllustration
                ? "mx-auto h-auto max-h-[38rem] w-full object-contain"
                : "h-64 w-full object-cover sm:h-72"
            }
            loading="lazy"
          />
          {img.title && (
            <figcaption className="border-t border-slate-100 px-4 py-3 text-center text-sm font-semibold text-[#0b3767]">
              {img.title}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

export function TemplateDrivenApplicationForm() {
  const { toast } = useToast();
  const [state, formAction] = useActionState(submitApplication, initialState);
  const [isPending, startTransition] = useTransition();

  const [template, setTemplate] = useState<any | null>(null);
  const [status, setStatus] = useState<"loading" | "active" | "not_started" | "closed">("loading");

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadActiveTemplate = async () => {
      try {
        const res = await fetch("/api/forms/active", { cache: "no-store" });
        const data = (await res.json()) as ActiveTemplateResponse;
        if (!mounted) return;
        if ("success" in data && data.success) {
          setTemplate(data.template ? normalizeTemplateShape(data.template) : null);
          setStatus(data.status);
        } else {
          setTemplate(null);
          setStatus("closed");
        }
      } catch {
        setTemplate(null);
        setStatus("closed");
      }
    };

    void loadActiveTemplate();
    const refreshTimer = setInterval(() => void loadActiveTemplate(), 15000);
    return () => {
      mounted = false;
      clearInterval(refreshTimer);
    };
  }, []);

  const targetDate = useMemo(() => {
    if (!template) return null;
    if (status === "active") return new Date(template.close_at);
    if (status === "not_started") return new Date(template.open_at);
    return null;
  }, [template, status]);

  const countdown = useMemo(() => {
    if (!targetDate) return null;
    return formatCountdown(targetDate.getTime() - nowMs);
  }, [nowMs, targetDate]);

  const defaultValues = useMemo(() => {
    return {
      templateId: template?.id ?? "",
      fullName: "",
      birthDate: "",
      className: "",
      studentId: "",
      email: "",
      phoneNumber: "",
      facebookUrl: "",
      hometown: "",
      gender: undefined,
      department: undefined,
      photo: undefined,
      optionalPersonal1: "",
      optionalPersonal2: "",
      optionalPersonal3: "",
      optionalPersonal4: "",
      optionalPersonal5: "",
      deptOptional1: "",
      deptOptional2: "",
      deptOptional3: "",
    };
  }, [template?.id]);

  const form = useForm<z.infer<typeof ApplicationFormSubmissionStrictSchema>>({
    resolver: zodResolver(ApplicationFormSubmissionStrictSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (!template?.id) return;
    form.reset({
      ...defaultValues,
      templateId: template.id,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id]);

  const selectedDepartment = form.watch("department") as Department | undefined;

  const deptQuestions = useMemo(() => {
    if (!template || !selectedDepartment) return null;
    const qs = template.department_questions?.[selectedDepartment];
    if (!qs) return null;
    return qs;
  }, [template, selectedDepartment]);

  const visiblePersonalQuestions = useMemo(
    () =>
      optionalPersonalKeys
        .map((key, i) => ({ key, label: String(template?.optional_personal_questions?.[i] ?? "").trim() }))
        .filter((q) => q.label.length > 0),
    [template]
  );

  const visibleDeptQuestions = useMemo(
    () =>
      deptOptionalKeys
        .map((key, i) => ({ key, label: String(deptQuestions?.[i] ?? "").trim() }))
        .filter((q) => q.label.length > 0),
    [deptQuestions]
  );

  const heroIllustrations = useMemo(() => {
    if (!template) return [];
    return (template.illustrations || []).filter((i: any) => i.slot === "hero");
  }, [template]);

  const personalIllustrations = useMemo(() => {
    if (!template) return [];
    return (template.illustrations || []).filter((i: any) => i.slot === "personal");
  }, [template]);

  const deptIllustrations = useMemo(() => {
    if (!template) return [];
    return (template.illustrations || []).filter((i: any) => i.slot === "department");
  }, [template]);

  const onSubmit = async (data: z.infer<typeof ApplicationFormSubmissionStrictSchema>) => {
    const formData = new FormData();
    formData.append("templateId", data.templateId);
    formData.append("fullName", data.fullName);
    formData.append("birthDate", data.birthDate);
    formData.append("className", data.className);
    formData.append("studentId", data.studentId);
    formData.append("email", data.email);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("facebookUrl", data.facebookUrl);
    formData.append("hometown", data.hometown);
    formData.append("gender", data.gender);
    formData.append("department", data.department);

    if (data.photo && typeof (data.photo as any).arrayBuffer === "function") {
      formData.append("photo", data.photo as File);
    }

    formData.append("optionalPersonal1", data.optionalPersonal1 || "");
    formData.append("optionalPersonal2", data.optionalPersonal2 || "");
    formData.append("optionalPersonal3", data.optionalPersonal3 || "");
    formData.append("optionalPersonal4", data.optionalPersonal4 || "");
    formData.append("optionalPersonal5", data.optionalPersonal5 || "");

    formData.append("deptOptional1", data.deptOptional1 || "");
    formData.append("deptOptional2", data.deptOptional2 || "");
    formData.append("deptOptional3", data.deptOptional3 || "");

    startTransition(() => {
      formAction(formData);
    });
  };

  useEffect(() => {
    if (!state?.message) return;
    if (state.issues && state.issues.length > 0) {
      toast({ title: "Lỗi xác thực", description: state.message, variant: "destructive" });
    } else {
      toast({ title: "Thành công!", description: state.message });
      form.reset();
    }
  }, [state, toast, form]);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        {status === "loading" && (
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-5 py-2.5 text-sm font-bold text-[#144E8C]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải biểu mẫu…
          </div>
        )}

        {status === "not_started" && countdown && (
          <div
            className="inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-white px-5 py-3 text-center text-base font-bold text-[#c94316] shadow-[0_12px_32px_rgba(240,90,35,0.16)] sm:px-7"
            role="timer"
            aria-live="polite"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F05A23] text-white shadow-sm">
              <Clock3 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              Mở đơn sau: <span className="font-extrabold text-[#9f3210]">{countdown.days} ngày {countdown.hours} giờ {countdown.minutes} phút {countdown.seconds} giây</span>
            </span>
          </div>
        )}

        {status === "active" && countdown && (
          <div
            className="inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-5 py-3 text-center text-base font-bold text-emerald-700 shadow-[0_12px_32px_rgba(5,150,105,0.16)] sm:px-7"
            role="timer"
            aria-live="polite"
          >
            <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white shadow-sm">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20" />
              <Clock3 className="relative h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              Đang mở đơn · Còn <span className="font-extrabold text-emerald-800">{countdown.days} ngày {countdown.hours} giờ {countdown.minutes} phút {countdown.seconds} giây</span>
            </span>
          </div>
        )}

        {status === "closed" && (
          <div
            className="inline-flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-base font-bold text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:px-7"
            role="status"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-700 text-white">
              <Clock3 className="h-5 w-5" aria-hidden="true" />
            </span>
            Đơn đăng ký hiện đã đóng
          </div>
        )}
      </div>

      {status === "active" && template && (
        <div className="space-y-7">
          <IllustrationList illustrations={heroIllustrations} />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {personalIllustrations.length > 0 && (
                <div className="mb-7">
                  <IllustrationList illustrations={personalIllustrations} />
                </div>
              )}

              <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(11,55,103,0.10)]">
                <CardHeader className="relative overflow-hidden border-b border-white/10 bg-[#0b3767] px-5 py-7 text-white sm:px-8 sm:py-9">
                  <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[44px] border-white/[0.05]" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(240,90,35,0.35),transparent_30%)]" />
                  <div className="relative">
                    <CardTitle className="font-headline text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl text-center">
                      {template.name || "Đơn đăng ký ứng tuyển"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 p-5 sm:p-8">
                  <section>
                    <div className="mb-5">
                      <h3 className="mt-2 text-xl font-bold text-[#F05A23]">01. Giới thiệu bản thân</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>Họ và tên *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nguyễn Văn A" className={FIELD_CLASS} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>Ngày sinh *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className={FIELD_CLASS} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="className"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>Lớp *</FormLabel>
                          <FormControl>
                            {Array.isArray((template as any)?.class_options) && (template as any).class_options.length > 0 ? (
                              <select
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                className={FIELD_CLASS}
                              >
                                <option value="">-- Chọn lớp --</option>
                                {((template as any).class_options as string[]).map((cls: string) => (
                                  <option key={cls} value={cls}>{cls}</option>
                                ))}
                              </select>
                            ) : (
                              <Input {...field} placeholder="Ví dụ: K22414" className={FIELD_CLASS} />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>MSSV *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nhập mã số sinh viên" className={FIELD_CLASS} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} placeholder="example@st.uel.edu.vn" className={FIELD_CLASS} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>Số điện thoại *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              {...field}
                              placeholder="0901 234 567"
                              className={FIELD_CLASS}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="facebookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>Link Facebook *</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              inputMode="url"
                              autoComplete="url"
                              {...field}
                              placeholder="https://facebook.com/..."
                              className={FIELD_CLASS}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hometown"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>Quê quán *</FormLabel>
                          <FormControl>
                            <Input
                              autoComplete="address-level1"
                              {...field}
                              placeholder="Tỉnh/Thành phố"
                              className={FIELD_CLASS}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>Giới tính *</FormLabel>
                          <FormControl>
                            <Input
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              list="gender-options"
                              placeholder="Nam/Nữ/Khác"
                              className={FIELD_CLASS}
                            />
                          </FormControl>
                          <datalist id="gender-options">
                            <option value="Nam" />
                            <option value="Nữ" />
                            <option value="Khác" />
                          </datalist>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="photo"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2 rounded-2xl border border-dashed border-[#144E8C]/25 bg-blue-50/40 p-4">
                          <FormLabel className={LABEL_CLASS}>Ảnh cá nhân (tùy chọn)</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => field.onChange(e.target.files?.[0])}
                              className={`${FIELD_CLASS} cursor-pointer bg-white file:mr-4 file:rounded-full file:bg-[#144E8C]/10 file:px-3 file:py-1 file:text-[#144E8C]`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>
                  </section>

                  {visiblePersonalQuestions.length > 0 && (
                  <section className="border-t border-slate-100 pt-8">
                    <h3 className="mt-2 text-xl font-bold text-[#F05A23]">02. Câu hỏi cá nhân</h3>
                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                      {visiblePersonalQuestions.map(({ key, label }) => {
                        return (
                          <FormField
                            key={key}
                            control={form.control}
                            name={key}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={LABEL_CLASS}>{label}</FormLabel>
                                <FormControl>
                                  <Textarea
                                    rows={3}
                                    {...field}
                                    className={TEXTAREA_CLASS}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        );
                      })}
                    </div>
                  </section>
                  )}

                  <section className="border-t border-slate-100 pt-8">
                    <h3 className="mt-2 text-xl font-bold text-[#F05A23]">03. Chọn ban bạn muốn đồng hành</h3>
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2"
                            >
                              {DEPARTMENTS.map((dept) => (
                                <FormItem
                                  key={dept}
                                  className={`flex cursor-pointer items-center space-x-3 rounded-xl border p-4 transition-all ${
                                    field.value === dept
                                      ? "border-[#144E8C] bg-blue-50 shadow-sm"
                                      : "border-slate-200 bg-white hover:border-[#144E8C]/40 hover:bg-slate-50"
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={dept}
                                    className="border-[#144E8C] text-[#144E8C] focus:ring-[#144E8C]"
                                  />
                                  <FormLabel className="m-0 cursor-pointer font-semibold text-slate-700">{dept}</FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </section>

                  {selectedDepartment && deptQuestions && visibleDeptQuestions.length > 0 && (
                    <section className="border-t border-slate-100 pt-8">
                      {deptIllustrations.length > 0 && <IllustrationList illustrations={deptIllustrations} />}
                      <h3 className="mt-2 text-xl font-bold text-[#F05A23]">04. Câu hỏi dành cho Ban {selectedDepartment}</h3>
                      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                        {visibleDeptQuestions.map(({ key, label }) => {
                          return (
                            <FormField
                              key={key}
                              control={form.control}
                              name={key}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={LABEL_CLASS}>{label}</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      rows={3}
                                      {...field}
                                      className={TEXTAREA_CLASS}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          );
                        })}
                      </div>
                    </section>
                  )}

                  <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-7 sm:flex-row">
                    <p className="text-center text-xs leading-5 text-slate-900 sm:text-left">
                      Bằng việc gửi đơn, bạn xác nhận các thông tin đã cung cấp là chính xác.
                    </p>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={form.formState.isSubmitting || isPending}
                      className="h-12 w-full rounded-full bg-[#F05A23] px-7 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 hover:bg-[#d84b18] hover:shadow-xl sm:w-auto"
                    >
                      {form.formState.isSubmitting || isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang gửi đơn…
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Gửi đơn ứng tuyển
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      )}

      {status !== "active" && state?.message && (
        <Alert className="mt-8">
          <AlertTitle>Thông báo</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
