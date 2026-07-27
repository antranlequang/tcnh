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
    <section className="relative flex h-[min(62svh,620px)] min-h-[420px] w-full items-end overflow-hidden bg-[#07192b] text-white md:h-[56vh] md:min-h-[520px]">
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="100vw"
        className={`absolute z-0 object-cover object-center ${className ?? ''}`}
        data-ai-hint={imageHint}
        priority
      />
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(7,25,43,0.18) 0%, rgba(7,25,43,0.42) 42%, rgba(7,25,43,0.94) 100%)',
        }}
      />
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(circle at 85% 12%, rgba(240,90,35,0.24), transparent 32%)',
        }}
      />
      <div className="relative z-20 mx-auto w-full max-w-[1500px] px-5 pb-9 sm:px-8 sm:pb-12 md:pb-16 lg:px-12">
        <span className="mb-4 block h-1 w-12 rounded-full bg-[#F05A23] sm:w-16" />
        <h1 className="max-w-5xl text-balance font-headline text-[clamp(2.35rem,10vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl md:text-7xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7 md:mt-5 md:text-lg">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
