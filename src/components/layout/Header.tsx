"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/achievements", label: "Thành tích" },
  { href: "/activities", label: "Hoạt động" },
  { href: "/structure", label: "Cơ cấu" },
  { href: "/blog", label: "Diễn đàn" },
  { href: "/youth", label: "Tuổi trẻ" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 h-[60px] shrink-0 bg-white text-[#144E8C] shadow-[0_4px_24px_rgba(11,31,51,0.08)] xl:h-[104px]">
      <div className="relative mx-auto h-full max-w-[1440px]">
        <Link
          href="/"
          className="absolute inset-y-0 left-4 z-10 flex items-center xl:left-8 xl:w-[340px]"
          aria-label="Đoàn Khoa Tài chính - Ngân hàng"
        >
          <img
            src="/images/logo.png"
            alt=""
            className="h-9 w-[138px] object-contain xl:h-14 xl:w-[168px]"
          />
          <span className="ml-4 hidden border-l border-[#144E8C]/15 pl-4 leading-none xl:block">
            <span className="block whitespace-nowrap text-xs font-bold uppercase tracking-[0.14em]">
              Đoàn Khoa
            </span>
            <span className="mt-1.5 block whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.08em] text-[#144E8C]/60">
              Tài chính — Ngân hàng
            </span>
          </span>
        </Link>

        <div className="absolute left-[380px] right-[calc((100vw-100%)/-2)] top-0 hidden h-10 items-center justify-end rounded-bl-[3.5rem] bg-[#144E8C] px-8 text-white xl:flex">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/72 text-bold">
            Thống nhất - Vượt trội - Tiên phong
          </span>
          <span className="ml-5 h-1.5 w-1.5 rounded-full bg-[#F05A23]" />
        </div>

        <div className="absolute bottom-0 right-8 hidden h-16 items-center gap-1 xl:flex">
          <nav className="flex items-center" aria-label="Điều hướng chính">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative px-4 py-6 text-sm font-semibold transition-colors after:absolute after:inset-x-4 after:bottom-3 after:h-0.5 after:origin-left after:bg-[#F05A23] after:transition-transform",
                    active
                      ? "text-[#144E8C] after:scale-x-100"
                      : "text-[#144E8C]/60 after:scale-x-0 hover:text-[#144E8C] hover:after:scale-x-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/apply"
            className="group ml-2 flex h-10 items-center gap-2 rounded-full bg-[#F05A23] pl-4 pr-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#d84b18]"
          >
            Ứng tuyển
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#144E8C] transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        <div className="absolute inset-y-0 right-3 flex items-center gap-1 xl:hidden">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-[#F05A23] transition-colors hover:bg-[#144E8C]/5"
            aria-label="Tìm kiếm"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#144E8C]/15 text-[#144E8C]"
              >
                <Menu className="h-[18px] w-[18px]" />
                <span className="sr-only">Mở menu</span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="h-[100dvh] w-full overflow-y-auto border-none bg-[#07192b] p-0 text-white sm:max-w-md [&>button]:right-5 [&>button]:top-[max(1.25rem,env(safe-area-inset-top))] [&>button]:z-20 [&>button]:text-white/70"
            >
              <div className="flex min-h-full flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mb-9 flex items-center gap-3 pr-12"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-white">
                    <img
                      src="/images/logo-dk.jpg"
                      alt="Logo Đoàn Khoa Tài chính - Ngân hàng"
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <span className="text-xs font-semibold uppercase leading-relaxed tracking-[0.15em]">
                    Đoàn Khoa
                    <span className="block text-[9px] text-white/45">
                      Tài chính — Ngân hàng
                    </span>
                  </span>
                </Link>

                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
                  Khám phá
                </p>
                <nav aria-label="Điều hướng chính">
                  {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex min-h-14 items-center justify-between border-b border-white/10 py-3.5 text-[17px] font-medium transition-colors",
                          active ? "text-white" : "text-white/50 hover:text-white"
                        )}
                      >
                        {item.label}
                        <ArrowUpRight
                          className={cn("h-4 w-4", active ? "text-[#F05A23]" : "text-white/25")}
                        />
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto pt-7">
                  <Link
                    href="/apply"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-12 items-center justify-between rounded-full bg-[#F05A23] pl-5 pr-2 text-sm font-semibold"
                  >
                    Gia nhập cùng chúng tớ
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#144E8C]">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
