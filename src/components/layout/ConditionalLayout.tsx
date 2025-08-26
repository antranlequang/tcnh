"use client";

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isA80Page = pathname === '/a80';

  if (isA80Page) {
    // A80 page with header but no footer, full height minus header
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <main className="flex-grow overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  // Normal layout with header and footer for other pages
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}