import Image from 'next/image';
import { PageBanner } from '@/components/shared/PageBanner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

const departments = [
  {
    name: "Ban Tổ chức - Xây dựng Đoàn",
    shortDescription: 'Vững vàng "Thông tin", sẵn sàng "Gắn kết"',
    content: "Nội dung đang được cập nhật...",
    images: [
      { src: "https://placehold.co/400x300.png", hint: "team planning" },
      { src: "https://placehold.co/400x300.png", hint: "organizational chart" },
      { src: "https://placehold.co/400x300.png", hint: "meeting notes" },
    ],
  },
  {
    name: "Ban Tuyên giáo - Sự kiện",
    shortDescription: 'Đem tất cả "dự định" thành "hiện thực"',
    content: "Nội dung đang được cập nhật...",
    images: [
      { src: "https://placehold.co/400x300.png", hint: "event setup" },
      { src: "https://placehold.co/400x300.png", hint: "stage design" },
    ],
  },
  {
    name: "Ban Truyền thông - Kỹ thuật",
    shortDescription: 'Ứng biến "nhanh nhạy", hoạt động "sáng tạo"',
    content: "Nội dung đang được cập nhật...",
    images: [
      { src: "https://placehold.co/400x300.png", hint: "social media" },
      { src: "https://placehold.co/400x300.png", hint: "live stream" },
      { src: "https://placehold.co/400x300.png", hint: "website design" },
      { src: "https://placehold.co/400x300.png", hint: "sound board" },
    ],
  },
  {
    name: "Ban Phong trào - Tình nguyện",
    shortDescription: "Gắn kết cộng đồng, chan chứa yêu thương",
    content: "Nội dung đang được cập nhật...",
    images: [
      { src: "https://placehold.co/400x300.png", hint: "group volunteering" },
      { src: "https://placehold.co/400x300.png", hint: "community outreach" },
    ],
  },
];

export default function StructurePage() {
  return (
    <div>
      <PageBanner
        title="CƠ CẤU TỔ CHỨC"
        subtitle="Một cây làm chẳng nên non, bốn ban chụm tầy quầy cho kao"
        imageUrl="/images/back-ocean.jpg"
        imageHint="teamwork architecture"
      />

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
            {departments.map((dept, index) => (
              <ScrollReveal key={index} delayMs={60 * index}>
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex flex-col">
                      <h3 className="font-headline text-xl md:text-2xl font-semibold text-primary">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 font-normal">{dept.shortDescription}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <p className="mb-6 text-muted-foreground">{dept.content}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {dept.images.map((image, imgIndex) => (
                        <div key={imgIndex} className="overflow-hidden rounded-lg shadow-md">
                          <Image
                            src={image.src}
                            alt={`${dept.name} image ${imgIndex + 1}`}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            data-ai-hint={image.hint}
                          />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </ScrollReveal>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  );
}
