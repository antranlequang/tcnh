import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { PageTransition } from '@/components/shared/PageTransition';
import { Sparkles } from '@/components/shared/Sparkles';
import { ConditionalLayout } from '@/components/layout/ConditionalLayout';

export const metadata: Metadata = {
  title: 'ĐK-TCNH',
  description: 'Trang web của Đoàn khoa Tài chính - Ngân hàng',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="aurora-container" aria-hidden>
          <div className="aurora a"></div>
          <div className="aurora b"></div>
          <div className="aurora c"></div>
        </div>
        <Sparkles />
        <Toaster />
        <ConditionalLayout>
          <PageTransition>
            {children}
          </PageTransition>
        </ConditionalLayout>
      </body>
    </html>
  );
}
