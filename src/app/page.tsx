"use client";  

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { Footer } from '@/components/layout/Footer';
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsVisible(entry.isIntersecting));
      },
      { threshold: 0.5 } // 50% video hiển thị mới tính
    );

    if (videoRef.current) observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVisible]);

  const carouselItems = [
    {
      image: "/images/achievement.png",
      hint: "achievement",
      title: "Nhấn vào",
      // description: "Nhấn để tìm hiểu thêm",
      link: "/achievements"
    },
    {
      image: "/images/activities.png",
      hint: "activities",
      title: "Nhấn vào",
      // description: "Nhấn để tìm hiểu thêm",
      link: "/activities"
    },
    {
      image: "/images/structure.png",
      hint: "structure",
      title: "Nhấn vào",
      // description: "Nhấn để tìm hiểu thêm",
      link: "/structure"
    },
    {
      image: "/images/blog.png",
      hint: "blog",
      title: "Nhấn vào",
      // description: "Nhấn để tìm hiểu thêm",
      link: "/blog"
    },
    {
      image: "/images/ai.png",
      hint: "ai",
      title: "Nhấn vào",
      // description: "Nhấn để tìm hiểu thêm",
      link: "/ai"
    },
    {
      image: "/images/a80.png",
      hint: "a80",
      title: "Coming soon",
      // description: "Nhấn để tìm hiểu thêm",
      link: "/a80"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Banner Section */}
      <section className="relative w-full text-center">
        <div className="relative">
          <Image
            src="/images/backkipu.jpg"
            alt="Finance - Banking Faculty Union"
            width={1920}
            height={600}
            className="w-full h-auto object-cover mt-0"
            data-ai-hint="university campus"
          />
          {/* <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-headline font-bold mb-4 drop-shadow-lg">
              CHÀO MỪNG ĐẾN VỚI 
            </h1>
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-headline font-extrabold mb-4 drop-shadow-lg">
              ĐOÀN KHOA TÀI CHÍNH - NGÂN HÀNG
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto drop-shadow-md font-semibold italic">
              Nơi trái tim gọi là "Nhà"
            </p>
          </div> */}
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="space-y-16">
              <div className="flex flex-col md:flex-row items-center gap-12 ">
                <div className="md:w-1/2 space-y-4 text-center">
                  <h2 className="text-3xl md:text-4xl font-anton font-medium text-primary">
                    <span className="block md:inline">ĐOÀN KHOA</span>{' '}
                    <span className="block md:inline mt-3">TÀI CHÍNH - NGÂN HÀNG</span>
                  </h2>
                  <p className="font-nunito text-muted-foreground text-lg text-justify">
                    Đoàn Khoa Tài chính - Ngân hàng tự hào là lực lượng tiên phong trong công tác Đoàn và phong trào thanh niên tại Trường Đại học Kinh tế - Luật. Dưới sự dẫn dắt của Đoàn Trường và Chi ủy - Ban Chủ nhiệm Khoa, Đoàn Khoa Tài chính - Ngân hàng luôn đem đến những hoạt động năng động, nhiệt huyết, với sự tham gia và cống hiến của đông đảo sinh viên.
                  </p>
                </div>
                <div className="md:w-1/2">
                  <Image
                    src="/images/doankhoa1.jpg"
                    alt="Group of students"
                    width={700}
                    height={500}
                    className="rounded-xl shadow-2xl"
                    data-ai-hint="students collaborating"
                  />
                </div>
              </div>

              <h2 className="text-5xl md:text-5xl font-passions font-medium text-primary mt-0 text-center italic">"Giữa muôn vàn lựa chọn, chúng ta đã chọn cùng nhau đi qua những tháng năm rực rỡ nhất."</h2>
              
              <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <div className="md:w-1/2 space-y-4 text-center">
                  <p className="font-nunito text-muted-foreground text-lg text-justify">
                  Mái nhà chung mang tên Đoàn khoa Tài chính - Ngân hàng, nơi các bạn có thể tìm thấy những người bạn đồng hành, những tri kỷ cùng chia sẻ đam mê, ước mơ và luôn an toàn, đáng tin cậy cho bạn hạ cánh viết tiếp những câu chuyện thanh xuân tươi đẹp khó phai. Bởi bằng ngọn lửa nhiệt huyết của tuổi trẻ, luôn sẵn sàng cống hiến vì những giá trị cộng đồng cùng tinh thần trách nhiệm và đoàn kết, Đoàn khoa Tài chính - Ngân hàng luôn là “tấm gương soi”, là cầu nối vững chắc, góp phần đưa các hoạt động Đoàn, các phong trào thanh niên tiêu biểu đến với các bạn sinh viên của Trường nói chung và sinh viên Khoa Tài chính - Ngân hàng nói riêng. 
                  </p>
                </div>
                <div className="md:w-1/2">
                  <Image
                    src="/images/doankhoa2.jpg"
                    alt="Group of students"
                    width={700}
                    height={500}
                    className="rounded-xl shadow-2xl"
                    data-ai-hint="students collaborating"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2 space-y-4 text-center">
                  <p className="font-nunito text-muted-foreground text-lg text-justify">
                  Với phương châm đặt lợi ích của sinh viên làm cốt lõi, từng hoạt động, chương trình của Đoàn Khoa không chỉ hứa hẹn sẽ tạo ra một môi trường năng động, sáng tạo và mang đậm dấu ấn riêng, mà còn góp phần nâng cao nhận thức chính trị, bồi dưỡng lý tưởng cách mạng cho đoàn viên, sinh viên. Các hoạt động được thiết kế nhằm hướng đến những nhu cầu thiết thực, kết hợp hài hòa giữa giáo dục chính trị – tư tưởng với phát triển kỹ năng và phong trào, qua đó đem lại cơ hội cho các bạn sinh viên thỏa sức khám phá bản thân, phát huy vai trò của tuổi trẻ, đồng thời lan tỏa những giá trị tích cực đến cộng đồng.
                  </p>
                </div>
                <div className="md:w-1/2">
                  <Image
                    src="/images/doankhoa3.jpg"
                    alt="Group of students"
                    width={700}
                    height={500}
                    className="rounded-xl shadow-2xl"
                    data-ai-hint="students collaborating"
                  />
                </div>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>
      
      <h2 className="text-center text-2xl md:text-5xl font-anton font-medium text-primary mt-0">LÀ MỘT TÂN SINH VIÊN, BẠN SẼ CHỌN GÌ?</h2>
      {/* Video Section */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="relative max-w-5xl mx-auto overflow-hidden rounded-xl shadow-2xl aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              src="/videos/video.mp4"
              controls
              muted={false} // có tiếng
              onEnded={() => {
                const section = document.getElementById("explore-section");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section id="explore-section" className="py-16 md:py-24">
        <div className="container mx-auto px-9 text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-anton font-medium text-primary mt-0 md:mt-0">
              TÌM HIỂU VỀ CHÚNG TỚ
            </h2>
            <p className="text-muted-foreground font-nunito font-semibold text-1xl md:text-3xl mx-auto mb-6 mt-5 md:mb-12">
              Các hoạt động, chương trình, sự kiện, thành tích nổi bật của Đoàn Khoa mình nè
            </p>
          </ScrollReveal>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {carouselItems.map((item, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <ScrollReveal delayMs={80 * index}>
                      <Link href={item.link} className="h-full block">
                        <Card className="h-full flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={600}
                            height={400}
                            className="w-full h-48 object-cover"
                            data-ai-hint={item.hint}
                          />
                          <CardContent className="p-6 flex-grow flex flex-col justify-between">
                            <div>
                              <h3 className="text-xl font-headline font-semibold mb-2">{item.title}</h3>
                              {/* <p className="text-muted-foreground text-sm">{item.description}</p> */}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </ScrollReveal>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 transform -translate-x-1/2" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 transform translate-x-1/2" />
          </Carousel>

          <h2 style={{ color: "#45973c" }} className="text-3xl md:text-5xl font-anton font-medium text-primary mt-10 md:mt-20">TUYỂN CỘNG TÁC VIÊN</h2>
          {/* <p className="text-muted-foreground font-nunito font-semibold text-1xl md:text-3xl mx-auto mb-0 mt-5">
              Các hoạt động, chương trình, sự kiện, thành tích nổi bật của Đoàn Khoa mình nè
            </p> */}
          <Image
            src="/images/back-bia.jpg"
            alt="Extra illustration"
            width={800}
            height={400}
            className="mt-6 md:mt-10 w-auto h-auto rounded-xl shadow-2xl object-cover mx-auto"
          />
          <div className="mt-6">
            <Link href="/apply">
              <Button className="bg-[#45973c] hover:bg-[#357a2e] text-white px-6 py-6 text-lg font-semibold">
                ỨNG TUYỂN NGAY
              </Button>
            </Link>
          </div>

        </div>
      </section>
      <Footer />
    </div>
  );
}
