import { PageBanner } from '@/components/shared/PageBanner';
import { ApplicationForm } from '@/components/apply/ApplicationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

export default function ApplyPage() {
  return (
    <div>
      <PageBanner
        title="GÓC TÌM NGƯỜI NHÀ"
        subtitle="Chừng chờ gì mà không tham gia vào Đoàn khoa Tài chính - Ngân hàng nhỉ"
        imageUrl="/images/back-ocean.jpg"
        imageHint="recruitment hiring"
      />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl font-headline text-primary text-center">Đơn đăng ký ứng tuyển</CardTitle>
                <CardDescription>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApplicationForm />
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
