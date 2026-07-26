"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, Facebook, Mail, MapPin, Phone } from "lucide-react";

const footerNavigation = [
  {
    title: "Khám phá",
    links: [
      { href: "/achievements", label: "Thành tích" },
      { href: "/activities", label: "Hoạt động" },
      { href: "/structure", label: "Cơ cấu" },
    ],
  },
  {
    title: "Kết nối",
    links: [
      { href: "/blog", label: "Diễn đàn" },
      { href: "/youth", label: "Tuổi trẻ" },
      { href: "/ai", label: "AI Advisor" },
    ],
  },
];

export function Footer() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const updateScrollButton = () => {
      setShowScrollToTop(window.scrollY > 0);
    };

    updateScrollButton();
    window.addEventListener("scroll", updateScrollButton, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollButton);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <>
      <footer id="site-footer" className="relative shrink-0 overflow-hidden bg-[#144E8C] text-white">
      <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full border-[70px] border-white/[0.035]" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 font-headline text-[14rem] font-semibold leading-none tracking-[-0.08em] text-white/[0.018]">
        ĐK-TCNH
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.55fr_0.55fr_1fr] lg:gap-10 lg:py-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex rounded-2xl bg-white px-4 py-3"
              aria-label="Đoàn Khoa Tài chính - Ngân hàng"
            >
              <img
                src="/images/logo.png"
                alt=""
                className="h-12 w-[190px] object-contain"
              />
            </Link>
            <p className="mt-6 max-w-sm text-lg font-medium">
              “Nơi trái tim gọi là Nhà.”
            </p>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/80">
              Cooked by Antranlequang
            </p>
            <p className="mt max-w-md text-sm leading-7 text-white/80">
              For website issue, please contact: tranlequangan2308@gmail.com
            </p>
          </div>

          {footerNavigation.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F05A23]">
                {group.title}
              </h3>
              <ul className="mt-5 space-y-3.5">
                {group.links.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2 text-sm text-white/85 transition-colors hover:text-white"
                    >
                      {item.label}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F05A23]">
              Liên hệ
            </h3>
            <div className="mt-5 space-y-4">
              <Link
                href="https://www.facebook.com/tcnh.uel"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 text-sm text-white/85 transition-colors hover:text-white"
              >
                <Facebook className="mt-0.5 h-4 w-4 shrink-0 text-[#F05A23]" />
                <span>Đoàn Khoa Tài chính - Ngân hàng</span>
              </Link>
              <Link
                href="mailto:dktaichinhnganhang@st.uel.edu.vn"
                className="group flex items-start gap-3 text-sm text-white/85 transition-colors hover:text-white"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#F05A23]" />
                <span className="break-all">dktaichinhnganhang@st.uel.edu.vn</span>
              </Link>
              <Link
                href="https://maps.app.goo.gl/Q6gASd51YERrNZJp7"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 text-sm text-white/85 transition-colors hover:text-white"
              >
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#F05A23]" />
                <span>669 Đỗ Mười, Phường Linh Xuân, TP. Hồ Chí Minh</span>
              </Link>
              <Link
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 text-sm text-white/85 transition-colors hover:text-white"
              >
                <Phone className="mt-1 h-4 w-4 shrink-0 text-[#F05A23]" />
                <span>0964 582 545 - Ms. Thảo Nguyên (Bí Thư)</span>
              </Link>              
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10 py-6 text-[11px] uppercase tracking-[0.14em] text-white/85">
          <p>
            © {new Date().getFullYear()} Đoàn Khoa Tài chính - Ngân hàng · UEL
          </p>
        </div>
      </div>
      </footer>

      <button
        type="button"
        onClick={scrollToTop}
        className={`fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-[#F05A23] text-white shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#d94d19] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A23] focus-visible:ring-offset-2 sm:bottom-8 sm:right-8 ${
          showScrollToTop
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
        aria-label="Về đầu trang"
        aria-hidden={!showScrollToTop}
        tabIndex={showScrollToTop ? 0 : -1}
        title="Về đầu trang"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </>
  );
}
