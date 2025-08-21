import Image from 'next/image';
import Link from 'next/link';
import { PageBanner } from '@/components/shared/PageBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';
import { CommentSection } from '@/components/blog/CommentSection';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

const testimonials = [
  {
    name: 'PHAN NHẬT MINH TRUNG',
    positions: ['Cựu Bí thư Đoàn Khoa Khóa 18', 'Cựu Trưởng ban Truyền thông - Kỹ thuật Khóa 18', 'Cựu Trưởng ban Tổ chức - Xây dựng Đoàn Khóa 18'],
    avatar: 'https://placehold.co/100x100.png',
    avatarHint: 'caovannhan',
    comment: 'Đang cập nhật...'
  },
  {
    name: 'CAO VĂN NHÂN',
    positions: ['Cựu Bí thư Đoàn Khoa Khóa 19', 'Cựu Trưởng ban Truyền thông - Kỹ thuật Khóa 19', 'Cựu Trưởng ban Tổ chức - Xây dựng Đoàn Khóa 19'],
    avatar: 'https://placehold.co/100x100.png',
    avatarHint: 'caovannhan',
    comment: 'Chào mấy bạn tân sinh viên ‘mầm non’ nha 🌱. Với anh thì Đoàn Khoa là một ngôi nhà nhỏ – chứa toàn bộ những kỷ niệm đắt giá nhất thời sinh viên. Ban đầu chỉ là tò mò, sôi nổi theo lửa Đoàn, gắn bó với trách nhiệm, cuối cùng là sự tự hào lớn gắn bó trong suốt 4 năm đại học. Ở đây mang theo những kỹ năng, trải nghiệm mới, những hành trình mới, gặp những ‘đồng chí’ cực dễ thương để cùng làm điều mình thích, và quan trọng nhất là bước đệm để trưởng thành hơn. Thế nên là bạn Đoàn không khô khan đâu nha – vui lắm, dễ thương lắm luôn đó! 😉'
  },
  {
    name: 'THÁI DƯƠNG THANH THẢO',
    positions: ['Cựu Phó Bí thư Đoàn Khoa Khóa 19', 'Cựu Trưởng ban Tuyên giáo - Sự kiện Khóa 19'],
    avatar: 'https://placehold.co/100x100.png',
    avatarHint: 'caovannhan',
    comment: 'Đang cập nhật...'
  },
  {
    name: 'NGUYỄN NGỌC HÂN',
    positions: ['Cựu Bí thư Đoàn Khoa Khóa 20', 'Cựu Phó ban Truyền thông - Kỹ thuật Khóa 20', 'Cựu Trưởng ban Tổ chức - Xây dựng Đoàn Khóa 20'],
    avatar: 'https://placehold.co/100x100.png',
    avatarHint: 'nguyenngochan',
    comment: 'Đang cập nhật...'
  },
  {
    name: 'ĐÀO THỊ THÙY DUNG',
    positions: ['Nguyên Bí thư Đoàn Khoa Khóa 21', 'Cựu Trưởng ban Tổ chức - Xây dựng Đoàn Khóa 21'],
    avatar: 'https://placehold.co/100x100.png',
    avatarHint: 'thuydung',
    comment: 'Đang cập nhật...'
  },
  {
    name: 'LÊ HOA ĐÀO',
    positions: ['Nguyên Phó Bí thư Đoàn Khoa Khóa 21', 'Nguyên Trưởng ban Tuyên giáo - Sự kiện Khóa 21'],
    avatar: 'https://placehold.co/100x100.png',
    avatarHint: 'lehoadao',
    comment: 'Đang cập nhật...'
  },
  {
    name: 'HOÀNG NGUYỄN BẢO TRÂM',
    positions: ['Nguyên UV.BCH Đoàn Khoa Khóa 21', 'Nguyên Trưởng ban Truyền thông - Kỹ thuật Khóa 21'],
    avatar: 'https://placehold.co/100x100.png',
    avatarHint: 'baotram',
    comment: 'Đang cập nhật...'
  },
  {
    name: 'LÂM HỒNG MINH QUÂN',
    positions: ['Nguyên Phó Bí thư Đoàn Khoa Khóa 22', 'Nguyên Trưởng ban Truyền thông - Kỹ thuật Khóa 22'],
    avatar: 'https://placehold.co/100x100.png',
    avatarHint: 'minhquan',
    comment: 'Đang cập nhật...'
  },
  {
    name: 'TRẦN LÊ QUANG AN',
    positions: ['Chủ nhiệm Chuyên san Tài chính và Công nghệ ứng dụng Khóa 22', 'Nguyên UV.BCH Đoàn Khoa Khóa 22', 'Thành viên Ban Tổ chức - Xây dựng Đoàn Khóa 22'],
    avatar: 'https://placehold.co/100x100.png',
    avatarHint: 'quangan',
    comment: 'Đang cập nhật...'
  },
];

export default function BlogPage() {
  return (
    <div>
      <PageBanner
        title="GÓC TÂM SỰ"
        subtitle="Đang bí văn..."
        imageUrl="/images/back-ocean.jpg"
        imageHint="community discussion"
      />

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {/* Testimonials */}
            <h2 className="text-2xl md:text-4xl font-headline font-semibold mb-8 text-primary text-center">Đôi lời gửi gắm từ cựu thành viên</h2>
            <div className="space-y-8">
              {testimonials.map((testimonial, index) => (
                <ScrollReveal key={index} delayMs={60 * index}>
                  <Card className="overflow-hidden shadow-lg">
                    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.avatarHint} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="relative text-center md:text-left">
                        <Quote className="absolute -top-2 left-0 h-8 w-8 text-primary/20 transform -translate-x-4" />
                        <p className="font-bold font-headline text-lg text-primary">{testimonial.name}</p>
                        <div className="mb-4 space-y-1">
                          {(testimonial.positions ?? [testimonial.positions]).map((pos, i) => (
                            <p key={i} className="text-sm font-semibold text-muted-foreground">{pos}</p>
                          ))}
                        </div>
                        <blockquote className="text-muted-foreground italic text-justify">{testimonial.comment}</blockquote>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
            
            {/* Comment Section */}
            {/* <div className="mt-16">
              <h2 className="text-3xl font-headline font-semibold mb-8">Để lại bình luận</h2>
              <CommentSection />
            </div> */}
          </div>

          {/* Fanpage Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg">
              <CardHeader>
                <h3 className="text-2xl md:text-3xl text-center text-primary font-headline font-semibold">FANPAGE</h3>
              </CardHeader>
              <CardContent>
                <Image
                  src="/images/banner.jpg"
                  alt="Fanpage preview"
                  width={400}
                  height={250}
                  className="rounded-lg mb-4 center"
                  data-ai-hint="social media page"
                />
                <p className="text-muted-foreground mb-4">
                  Hãy theo dõi fanpage của chúng tớ để cập nhật những thông tin mới nhất về các hoạt động của Khoa, Trường nhaa.
                </p>
                <Button asChild className="w-full">
                  <Link href="https://www.facebook.com/tcnh.uel" target="_blank" rel="noopener noreferrer">Ghé thăm Fanpage</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
