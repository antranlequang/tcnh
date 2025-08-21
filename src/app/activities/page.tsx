import Image from 'next/image';
import { PageBanner } from '@/components/shared/PageBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

const programs = [
    {
        name: 'Gặp mặt Tân sinh viên Khóa ...',
        description: 'Đang cập nhật...',
        images: [
            { src: 'https://placehold.co/600x400.png', hint: 'conference speaker' },
            { src: 'https://placehold.co/600x400.png', hint: 'audience networking' },
            { src: 'https://placehold.co/600x400.png', hint: 'panel discussion' },
        ],
    },
    {
        name: 'Chuỗi sinh hoạt Chính trị "Đồng chí ơi! Mình đi đâu thế?"',
        description: 'Đang cập nhật...',
        images: [
            { src: 'https://placehold.co/600x400.png', hint: 'conference speaker' },
            { src: 'https://placehold.co/600x400.png', hint: 'audience networking' },
            { src: 'https://placehold.co/600x400.png', hint: 'panel discussion' },
        ],
    },
];

const categories = [
    {
        name: 'Bảo vệ môi trường',
        description: 'Đang cập nhật...',
        images: [
            { src: 'https://placehold.co/600x400.png', hint: 'students workshop' },
            { src: 'https://placehold.co/600x400.png', hint: 'data analysis' },
            { src: 'https://placehold.co/600x400.png', hint: 'presentation screen' },
        ],
    },

    {
        name: 'Review sách',
        description: 'Truyền cảm hứng qua từng trang giấy',
        images: [
            { src: 'https://placehold.co/600x400.png', hint: 'students workshop' },
            { src: 'https://placehold.co/600x400.png', hint: 'data analysis' },
            { src: 'https://placehold.co/600x400.png', hint: 'presentation screen' },
        ],
    },

    {
        name: 'An toàn giao thông',
        description: 'Đi cẩn thận không bể đầu',
        images: [
            { src: 'https://placehold.co/600x400.png', hint: 'students workshop' },
            { src: 'https://placehold.co/600x400.png', hint: 'data analysis' },
            { src: 'https://placehold.co/600x400.png', hint: 'presentation screen' },
        ],
    },
    {
        name: 'VOF - Voice of FBers',
        description: 'Nơi lắng nghe tiếng nói sinh viên',
        images: [
            { src: 'https://placehold.co/600x400.png', hint: 'students workshop' },
            { src: 'https://placehold.co/600x400.png', hint: 'data analysis' },
            { src: 'https://placehold.co/600x400.png', hint: 'presentation screen' },
        ],
    },
    {
        name: "Food's Bestie",
        description: 'Góc nhỏ ẩm thực cho tâm hồn lớn',
        images: [
            { src: 'https://placehold.co/600x400.png', hint: 'students workshop' },
            { src: 'https://placehold.co/600x400.png', hint: 'data analysis' },
            { src: 'https://placehold.co/600x400.png', hint: 'presentation screen' },
        ],
    },
];

const partners = [
    { name: 'MB Bank', logo: '/images/corp/mb.png'},
    { name: 'ACB', logo: '/images/corp/acb.png'},
    { name: 'SSI Securities', logo: '/images/corp/ssi.png'},
    { name: 'VCB', logo: '/images/corp/vcb.webp'},
    { name: 'PH Securities', logo: '/images/corp/ph.jpeg'},
];

export default function ActivitiesPage() {
    return (
        <div>
            <PageBanner
                title="Hoạt động của chúng tớ"
                subtitle="Các chương trình và sự kiện hấp dẫn mà Đoàn Khoa đã tổ chức."
                imageUrl="/images/back-ocean.jpg"
                imageHint="students event"
            />

            <main className="container mx-auto px-8 py-16 md:py-24">
                <Tabs defaultValue="program" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                        <TabsTrigger value="program" className="text-lg md:text-xl font-semibold">Chương trình</TabsTrigger>
                        <TabsTrigger value="category" className="text-lg md:text-xl font-semibold">Chuyên mục</TabsTrigger>
                    </TabsList>
                    <TabsContent value="program" className="mt-12">
                        <div className="space-y-12">
                            {programs.map((program, idx) => (
                                <ScrollReveal key={program.name} delayMs={80 * idx}>
                                  <Card className="overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 grid md:grid-cols-2 bg-white">
                                    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center">
                                        <Carousel className="w-full max-w-sm" opts={{loop: true}}>
                                            <CarouselContent>
                                                {program.images.map((image, i) => (
                                                    <CarouselItem key={i}>
                                                        <Image src={image.src} alt={`${program.name} image ${i + 1}`} width={600} height={400} className="rounded-xl object-cover transform transition-transform duration-300 hover:scale-105" data-ai-hint={image.hint}/>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 left-2 text-white bg-transparent hover:bg-transparent" />
                                            <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-2 text-white bg-transparent hover:bg-transparent" />
                                        </Carousel>
                                    </div>
                                    <div className="p-8 flex flex-col justify-center">
                                        <h3 className="font-headline text-3xl font-bold text-primary text-justify mb-4">{program.name}</h3>
                                        <p className="text-muted-foreground leading-relaxed text-justify">{program.description}</p>
                                    </div>
                                  </Card>
                                </ScrollReveal>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="category" className="mt-12">
                        <div className="space-y-12">
                            {categories.map((category, idx) => (
                                <ScrollReveal key={category.name} delayMs={80 * idx}>
                                  <Card className="overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 grid md:grid-cols-2 bg-white">
                                    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center md:order-last">
                                        <Carousel className="w-full max-w-sm" opts={{loop: true}}>
                                            <CarouselContent>
                                                {category.images.map((image, i) => (
                                                    <CarouselItem key={i}>
                                                        <Image src={image.src} alt={`${category.name} image ${i + 1}`} width={600} height={400} className="rounded-xl object-cover transform transition-transform duration-300 hover:scale-105" data-ai-hint={image.hint}/>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 left-2 text-white bg-transparent hover:bg-transparent" />
                                            <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-2 text-white bg-transparent hover:bg-transparent" />
                                        </Carousel>
                                    </div>
                                    <div className="p-8 flex flex-col justify-center">
                                        <h3 className="font-headline text-3xl font-bold text-primary text-justify mb-4">{category.name}</h3>
                                        <p className="text-muted-foreground leading-relaxed text-justify">{category.description}</p>
                                    </div>
                                  </Card>
                                </ScrollReveal>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
                
                {/* Partners Section */}
                <section className="mt-24">
                    <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center mb-12 text-primary">CÁC ĐƠN VỊ ĐÃ HỢP TÁC</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center">
                        {partners.map((partner, index) => (
                            <div key={`${partner.name}-${index}`} className="flex justify-center" title={partner.name}>
                                <Image 
                                    src={partner.logo} 
                                    alt={`${partner.name} logo`}
                                    width={150}
                                    height={80}
                                    className="object-contain w-auto h-[80px]"
                                    data-ai-hint={partner.name}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
