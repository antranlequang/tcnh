"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  GraduationCap,
  House,
  Layers3,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { cn } from "@/lib/utils";

type HomeSettings = {
  youtubeVideoUrl: string;
};

export type HeroSlide = {
  src: string;
  alt: string;
};

const exploreItems = [
  {
    image: "/images/home-button/achievement.png",
    eyebrow: "",
    title: "Thành tích",
    description: "Những cột mốc đáng tự hào trên hành trình của tuổi trẻ Tài chính - Ngân hàng.",
    href: "/achievements",
  },
  {
    image: "/images/home-button/activities.png",
    eyebrow: "",
    title: "Hoạt động",
    description: "Các chương trình học thuật, phong trào và sự kiện gắn kết sinh viên.",
    href: "/activities",
  },
  {
    image: "/images/home-button/structure.png",
    eyebrow: "",
    title: "Cơ cấu",
    description: "Gặp gỡ bốn ban chuyên môn cùng xây dựng nên một tập thể vững mạnh.",
    href: "/structure",
  },
  {
    image: "/images/home-button/blog.png",
    eyebrow: "",
    title: "Diễn đàn",
    description: "Không gian sẻ chia câu chuyện, trải nghiệm và những điều sinh viên quan tâm.",
    href: "/blog",
  },
  {
    image: "/images/home-button/ai.png",
    eyebrow: "",
    title: "AI Advisor",
    description: "Khám phá thế mạnh cá nhân và tìm ban phù hợp với bạn.",
    href: "/ai",
  },
  {
    image: "/images/home-button/a80.png",
    eyebrow: "",
    title: "Rạng Rỡ Việt Nam",
    description: "Cùng lưu lại những lời chúc và khoảnh khắc mang sắc màu Việt Nam.",
    href: "/youth/a80",
  },
];

const heroWords = [
  "Thống nhất",
  "Vượt trội",
  "Tiên phong",
];

const impactStats = [
  { value: "4", label: "Ban chuyên môn", icon: Layers3 },
  { value: "01", label: "Mái nhà chung", icon: House },
  { value: "∞", label: "Năng lượng trẻ", icon: Zap },
  { value: "UEL", label: "Cùng một niềm tự hào", icon: GraduationCap },
];

function AnimatedStatValue({ value }: { value: string }) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const numericValue = /^\d+$/.test(value) ? Number(value) : null;
  const [displayValue, setDisplayValue] = useState(numericValue === null ? value : "0");

  useEffect(() => {
    const element = valueRef.current;
    if (!element || numericValue === null) return;

    let animationFrame = 0;
    let hasAnimated = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated) return;
        hasAnimated = true;

        const startedAt = performance.now();
        const duration = 2_000;
        const padLength = value.length;
        const randomLimit = Math.pow(10, padLength) - 1;
        let lastUpdatedAt = 0;
        const animate = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);

          if (progress < 1) {
            if (now - lastUpdatedAt >= 65) {
              const randomValue = Math.floor(Math.random() * (randomLimit + 1));
              setDisplayValue(String(randomValue).padStart(padLength, "0"));
              lastUpdatedAt = now;
            }
            animationFrame = window.requestAnimationFrame(animate);
          } else {
            setDisplayValue(value);
          }
        };

        animationFrame = window.requestAnimationFrame(animate);
        observer.disconnect();
      },
      { threshold: 0.55 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [numericValue, value]);

  return <span ref={valueRef}>{displayValue}</span>;
}

function parseYouTubeId(value: string) {
  const match = value.match(
    /(?:youtube\.com\/(?:.*[?&]v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? "";
}

export default function HomePageClient({
  heroSlides,
}: {
  heroSlides: HeroSlide[];
}) {
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const heroShowcaseRef = useRef<HTMLDivElement>(null);
  const [videoInView, setVideoInView] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [heroScroll, setHeroScroll] = useState(0);
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const [heroWordVisible, setHeroWordVisible] = useState(true);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [settings, setSettings] = useState<HomeSettings>({ youtubeVideoUrl: "" });
  const { scrollYProgress: showcaseScrollProgress } = useScroll({
    target: heroShowcaseRef,
    offset: ["start 70%", "start 8%"],
  });
  const rawShowcaseTilt = useTransform(showcaseScrollProgress, [0, 1], [0, 12]);
  const rawShowcaseScale = useTransform(showcaseScrollProgress, [0, 1], [1, 0.965]);
  const smoothShowcaseTilt = useSpring(rawShowcaseTilt, {
    stiffness: 90,
    damping: 24,
    mass: 0.55,
  });
  const smoothShowcaseScale = useSpring(rawShowcaseScale, {
    stiffness: 90,
    damping: 24,
    mass: 0.55,
  });

  useEffect(() => {
    let fadeTimer: number | undefined;
    const wordTimer = window.setInterval(() => {
      setHeroWordVisible(false);
      fadeTimer = window.setTimeout(() => {
        setHeroWordIndex((current) => (current + 1) % heroWords.length);
        setHeroWordVisible(true);
      }, 300);
    }, 3000);

    return () => {
      window.clearInterval(wordTimer);
      if (fadeTimer) window.clearTimeout(fadeTimer);
    };
  }, []);

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 10_000);

    return () => window.clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setHeroScroll(window.scrollY);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVideoInView(entry.isIntersecting),
      { threshold: 0.35 }
    );
    const current = videoSectionRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    fetch("/api/home-settings", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.youtubeVideoUrl) {
          setSettings({ youtubeVideoUrl: String(data.youtubeVideoUrl) });
        }
      })
      .catch(() => undefined);

    fetch("/api/admin/visits", { method: "POST" }).catch(() => undefined);
  }, []);

  const videoId = parseYouTubeId(settings.youtubeVideoUrl);
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&rel=0&modestbranding=1`
    : "";

  return (
    <div className="overflow-hidden bg-white text-[#0b1f33]">
      <section
        className="terra-reference-hero hero-initial-load relative min-h-screen overflow-hidden bg-[#07192b] px-4 pb-16 pt-28 text-white md:pb-24 md:pt-32"
      >
        <div
          className="absolute inset-0"
          style={{ transform: `translateY(${heroScroll * 0.25}px)` }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={heroSlides[heroSlideIndex].src}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.2, ease: "easeInOut" },
                scale: { duration: 10, ease: "linear" },
              }}
            >
              <Image
                src={heroSlides[heroSlideIndex].src}
                alt={heroSlides[heroSlideIndex].alt}
                fill
                priority={heroSlideIndex === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute inset-0 bg-[#07192b]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07192b] via-[#07192b]/72 to-[#07192b]/5" />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#07192b]/55 to-transparent" />

        <div className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setHeroSlideIndex(index)}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                index === heroSlideIndex
                  ? "w-9 bg-[#F05A23]"
                  : "w-5 bg-white/45 hover:bg-white/80"
              )}
              aria-label={`Hiển thị ảnh ${index + 1}`}
              aria-current={index === heroSlideIndex}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1120px]">
          <div
            className="invisible mx-auto mb-10 w-full max-w-[1040px] px-5 py-9 text-center sm:px-8 md:mb-14 md:px-12 md:py-11"
            aria-hidden="true"
          >
            <h1
              className="hero-stagger mx-auto mt-6 max-w-5xl text-balance font-headline text-[clamp(3rem,6.2vw,5.9rem)] font-semibold leading-[0.88] tracking-[-0.06em]"
              style={{ animationDelay: "100ms" }}
            >
              <motion.span
                className="block text-[#F05A23]"
                initial={{ opacity: 0, y: 32, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              >
                Đoàn Khoa
              </motion.span>
              <motion.span
                className="mt-2 block text-white"
                initial={{ opacity: 0, y: 32, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                Tài chính — Ngân hàng
              </motion.span>
            </h1>

            <div
              className="hero-stagger mx-auto mt-8 flex max-w-xl items-center gap-4"
              style={{ animationDelay: "260ms" }}
            >
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/95" />
              <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 sm:text-2xl">
                Trường Đại học Kinh tế - Luật
              </p>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/95" />
            </div>

            {/* <div
              className="hero-stagger mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
              style={{ animationDelay: "270ms" }}
            >
              <Button asChild size="lg" className="bg-[#F05A23] px-7 text-white shadow-xl hover:bg-[#d84b18]">
                <Link href="/apply">
                  Gia nhập cùng chúng tớ
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 px-7 text-white backdrop-blur-xl hover:bg-white/12 hover:text-white"
              >
                <Link href="#story">
                  Khám phá hành trình
                  <ArrowDown className="h-4 w-4" />
                </Link>
              </Button>
          </div> */}

          </div>

          <div
            ref={heroShowcaseRef}
            className="hero-showcase hero-stagger mx-auto mt-10 max-w-[1040px]"
            style={{ animationDelay: "360ms", perspective: "1200px" }}
          >
            <motion.div
              className="relative aspect-[16/10] overflow-hidden rounded-[24px] border border-white/15 bg-[#0b1f33] shadow-[0_35px_100px_rgba(0,0,0,0.55)] md:aspect-[16/9]"
              style={{
                rotateX: smoothShowcaseTilt,
                scale: smoothShowcaseScale,
                transformPerspective: 1400,
                transformStyle: "preserve-3d",
                transformOrigin: "center top",
                willChange: "transform",
              }}
            >
              <Image
                src="/images/hero-page/1.webp"
                alt="Tập thể Đoàn Khoa Tài chính - Ngân hàng"
                fill
                priority
                sizes="(max-width: 1120px) 92vw, 1040px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07192b]/85 via-transparent to-[#07192b]/15" />

            </motion.div>
          </div>
        </div>
      </section>

      <section id="story" className="relative px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-[1380px]">
          <ScrollReveal>
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
              <div>
                <p className="sm:text-xl md:text-2xl section-kicker">Về chúng tớ</p>
                <h2 className="mt-4 text-balance font-headline text-4xl font-semibold tracking-[-0.045em] text-[#144E8C] sm:text-5xl md:text-6xl">
                  Cùng nhau tạo nên những điều có ý nghĩa.
                </h2>
              </div>
              <div className="flex flex-col justify-end">
                <p className="text-lg leading-8 text-slate-600 md:text-xl md:leading-9 text-justify">
                  Đoàn Khoa Tài chính - Ngân hàng là lực lượng tiên phong trong
                  công tác Đoàn và phong trào thanh niên tại Trường Đại học Kinh
                  tế - Luật. Mỗi chương trình là một cơ hội để sinh viên khám
                  phá bản thân, trưởng thành và lan tỏa giá trị tích cực.
                </p>
                <Link
                  href="/structure"
                  className="mt-8 inline-flex w-fit items-center gap-2 border-b-2 border-[#F05A23] pb-1 font-semibold text-[#144E8C] transition-colors hover:text-[#F05A23]"
                >
                  Tìm hiểu về tập thể
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          <div className="mt-16 grid gap-5 md:grid-cols-12 md:grid-rows-2">
            <ScrollReveal className="md:col-span-7 md:row-span-2">
              <div className="group relative min-h-[560px] overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/hero-page/1.webp"
                  alt="Tập thể Đoàn Khoa Tài chính - Ngân hàng"
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f33]/75 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b1f33]/95 via-[#0b1f33]/70 to-transparent px-7 pb-7 pt-24">
                  <p className="max-w-lg text-2xl font-semibold leading-tight text-white md:text-2xl italic">
                    “Giữa muôn vàn lựa chọn, chúng ta đã chọn cùng nhau đi qua
                    những tháng năm rực rỡ nhất.”
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal className="md:col-span-5">
              <div className="flex min-h-[270px] flex-col justify-between rounded-[2rem] bg-[#F05A23] p-7 text-white md:p-9">
                <span className="text-sm font-semibold uppercase tracking-[0.22em] text-white/95">
                  Tinh thần
                </span>
                <div>
                  <strong className="block font-headline text-5xl tracking-[-0.05em] text-white">
                    Slogan...
                  </strong>
                  <p className="mt-3 max-w-sm text-white/95">
                    Writing something here....
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal className="md:col-span-5">
              <div className="group relative min-h-[270px] overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/hero-page/2.webp"
                  alt="Hoạt động sinh viên"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-8">
          {impactStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 48, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 145,
                  damping: 12,
                  delay: index * 0.08,
                }}
                className="flex flex-col items-center"
              >
                <div className="grid h-20 w-20 place-items-center rounded-full bg-[#f3f7fb] text-[#144E8C] md:h-24 md:w-24">
                  <Icon className="h-9 w-9 stroke-[1.5] md:h-11 md:w-11" />
                </div>
                <strong className="mt-5 block font-headline text-4xl font-semibold tracking-[-0.045em] text-[#F05A23] md:text-5xl">
                  <AnimatedStatValue value={stat.value} />
                </strong>
                <span className="mt-3 text-sm font-semibold text-[#0b1f33] md:text-base">
                  {stat.label}
                </span>
              </motion.div>
            );
          })}
        </div>

      </section>

      <section className="bg-[#f4f7fa] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-[1380px]">
          <ScrollReveal>
            <div className="flex w-full justify-end">
              <div>
                <h2 className="mt-4 max-w-4xl text-right italic font-headline text-4xl font-semibold tracking-[-0.045em] text-[#144E8C] sm:text-5xl md:text-7xl">
                  Có một nơi dành cho bạn.
                </h2>
              </div>
            </div>
          </ScrollReveal>

          <Carousel opts={{ align: "start", loop: true }} className="mt-12">
            <CarouselContent className="-ml-5">
              {exploreItems.map((item, index) => (
                <CarouselItem key={item.href} className="pl-5 md:basis-1/2 lg:basis-1/3">
                  <ScrollReveal delayMs={60 * index}>
                    <Link href={item.href} className="group block">
                      <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white text-[#144E8C] shadow-lg transition-colors group-hover:bg-[#F05A23] group-hover:text-white">
                            <ArrowUpRight className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="p-7">
                          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F05A23]">
                            {item.eyebrow}
                          </p>
                          <h3 className="mt-3 font-headline text-3xl font-semibold tracking-tight text-[#144E8C]">
                            {item.title}
                          </h3>
                          <p className="mt-3 leading-7 text-slate-600">{item.description}</p>
                        </div>
                      </article>
                    </Link>
                  </ScrollReveal>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-9 flex items-center justify-end gap-3">
              <CarouselPrevious className="static h-12 w-12 translate-y-0 border-[#F05A23] text-[#144E8C] hover:bg-[#F05A23] hover:text-white" />
              <CarouselNext className="static h-12 w-12 translate-y-0 border-[#F05A23] text-[#144E8C] hover:bg-[#F05A23] hover:text-white" />
            </div>
          </Carousel>
        </div>
      </section>

      <section ref={videoSectionRef} className="bg-[#144E8C] px-5 py-20 text-white sm:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-[1380px]">
          <div className="grid items-end gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <ScrollReveal>
              <h2 className="mt-4 max-w-xl font-headline text-4xl font-semibold tracking-[-0.045em] sm:text-5xl md:text-6xl">
                Là một tân sinh viên, bạn sẽ chọn gì?
              </h2>
            </ScrollReveal>

            <ScrollReveal>
              <div className="relative aspect-video overflow-hidden rounded-[2rem] bg-[#0b1f33] shadow-2xl">
                <button
                  type="button"
                  onClick={() => setIsMuted((current) => !current)}
                  className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white text-[#144E8C] shadow-lg transition-colors hover:bg-[#F05A23] hover:text-white"
                  aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                {videoInView && embedUrl ? (
                  <iframe
                    className="h-full w-full"
                    src={embedUrl}
                    title="Video giới thiệu Đoàn Khoa"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-white/65">
                    {videoId
                      ? "Video sẽ phát khi bạn cuộn đến đây."
                      : "Video giới thiệu đang được cập nhật."}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <ScrollReveal>
          <div className="relative mx-auto max-w-[1380px] overflow-hidden rounded-[2.5rem] bg-[#F05A23] px-7 py-16 text-white md:px-14 md:py-20">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[50px] border-white/10" />
            <div className="relative z-10 flex flex-col gap-9 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="mt-4 max-w-4xl font-headline text-4xl font-semibold tracking-[-0.045em] sm:text-5xl md:text-7xl">
                  Thanh xuân đẹp hơn khi chúng ta đi cùng nhau!
                </h2>
              </div>
              <Button asChild size="lg" className="w-fit rounded-full bg-white px-7 text-[#144E8C] hover:bg-[#144E8C] hover:text-white">
                <Link href="/apply">
                  Ứng tuyển ngay
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
