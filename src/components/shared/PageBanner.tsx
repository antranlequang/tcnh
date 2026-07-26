import Image from 'next/image';

interface PageBannerProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageHint: string;
  className?: string;
}

export function PageBanner({
  title,
  subtitle,
  imageUrl,
  imageHint,
  className,
}: PageBannerProps) {
  return (
    <section className="relative flex min-h-[56vh] w-full items-end overflow-hidden text-white">
      <Image
        src={imageUrl}
        alt={title}
        fill
        className={`absolute z-0 object-cover ${className ?? ''}`}
        data-ai-hint={imageHint}
        priority
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#07192b]/20 via-[#07192b]/60 to-[#07192b]/95" />
      <div className="relative z-20 mx-auto w-full max-w-[1500px] px-5 pb-12 sm:px-8 md:pb-16 lg:px-12">
        <h1 className="max-w-5xl text-balance font-headline text-4xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-6xl md:text-7xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
