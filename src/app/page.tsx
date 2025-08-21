import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

export default function Home() {
  const carouselItems = [
    {
      image: "/images/achievement.png",
      hint: "achievement",
      title: "Nhấn điii",
      // description: "Nhấn để tìm hiểu thêm",
      link: "/achievements"
    },
    {
      image: "/images/activities.png",
      hint: "activities",
      title: "Nhấn điii",
      // description: "Nhấn để tìm hiểu thêm",
      link: "/activities"
    },
    {
      image: "/images/structure.png",
      hint: "structure",
      title: "Nhấn điii",
      // description: "Nhấn để tìm hiểu thêm",
      link: "/structure"
    },
    {
      image: "/images/blog.png",
      hint: "blog",
      title: "Nhấn điii",
      // description: "Nhấn để tìm hiểu thêm",
      link: "/blog"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Banner Section */}
      <section className="relative w-full text-center">
        <div className="relative">
          <Image
            src="/images/backkipu.png"
            alt="Finance - Banking Faculty Union"
            width={1920}
            height={600}
            className="w-full h-auto object-cover"
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
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-1 md:order-2">
                <Image
                  src="/images/doankhoa.jpg"
                  alt="Group of students"
                  width={700}
                  height={500}
                  className="rounded-xl shadow-2xl"
                  data-ai-hint="students collaborating"
                />
              </div>
              <div className="order-2 md:order-1 space-y-4 text-center">
                <h2 className="text-3xl md:text-4xl font-headline font-semibold text-primary">
                  <span className="block md:inline">Đoàn khoa</span>{' '}
                  <span className="block md:inline">Tài chính - Ngân hàng</span>
                </h2>
                <p className="text-muted-foreground text-lg text-justify">
                Đoàn khoa là tổ chức chính trị - xã hội, đóng vai trò là cầu nối, mang các hoạt động và phong trào thanh niên đến gần hơn với sinh viên. Mục tiêu hoạt động của tổ chức này là lấy lợi ích của sinh viên làm trọng tâm, từ đó tổ chức các chương trình thiết thực, giúp sinh viên phát huy những giá trị tốt đẹp và lan tỏa các phong trào tích cực.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="relative w-full overflow-hidden rounded-xl shadow-2xl" style={{ paddingTop: "56.25%" }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              src="https://www.youtube.com/embed/Hqmbo0ROBQw?si=0shOzqdwtHBptPjJ&t=32"
              title="Intro Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-headline font-semibold text-primary">TÌM HIỂU VỀ CHÚNG TỚ</h2>
            <p className="text-muted-foreground font-semibold text-2xl md:text-1xl mx-auto mb-12">
              Các hoạt động, sự kiện, thành tích nổi bật của Đoàn Khoa mình nè.
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

          <h2 className="text-3xl md:text-4xl font-headline font-semibold text-primary mt-32">CHƯƠNG TRÌNH TUYỂN TÂN THÀNH VIÊN</h2>
          <Image
            src="/images/banner-tuyen.png"
            alt="Extra illustration"
            width={1200}
            height={600}
            className="mt-10 w-full h-auto rounded-xl shadow-2xl object-cover"
          />
          <div className="mt-6">
            <Link href="/apply">
              <Button className="px-6 py-6 text-lg font-semibold">
                ỨNG TUYỂN NGAY
              </Button>
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
