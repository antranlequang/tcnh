"use client";

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname === '/admin';
  const isSchoolMapPage = pathname === '/youth/school-map';

  if (isAdminPage) {
    // Admin page renders its own shell
    return <>{children}</>;
  }

  if (isSchoolMapPage) {
    // Preserve a full viewport for the interactive map, then show the global footer.
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="h-[calc(100dvh-60px)] shrink-0 overflow-hidden xl:h-[calc(100dvh-104px)]">
          {children}
        </main>
        <Footer />
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
