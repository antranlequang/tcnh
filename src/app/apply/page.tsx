import { PageBanner } from '@/components/shared/PageBanner';
import { TemplateDrivenApplicationForm } from '@/components/apply/TemplateDrivenApplicationForm';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

export default function ApplyPage() {
  return (
    <div className="apply-page bg-[#f4f7fb]">
      <PageBanner
        title="Đơn đăng ký ứng tuyển"
        subtitle='"Chần chờ gì mà không tham gia vào Đoàn khoa Tài chính - Ngân hàng"'
        imageUrl="/images/banner-page/uel.webp"
        imageHint="recruitment hiring"
      />
      <main className="relative overflow-hidden px-4 py-16 sm:px-6 md:py-24">
        <div className="pointer-events-none absolute -right-32 top-16 h-80 w-80 rounded-full bg-[#F05A23]/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-16 h-80 w-80 rounded-full bg-[#144E8C]/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <ScrollReveal>
            <TemplateDrivenApplicationForm />
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
