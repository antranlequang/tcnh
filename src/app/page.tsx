import { readdir } from "node:fs/promises";
import path from "node:path";
import HomePageClient, { type HeroSlide } from "./HomePageClient";

const supportedImageExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
  ".JPG",
  ".JPEG",
  ".PNG",
  ".WEBP",
]);

async function getHeroSlides(): Promise<HeroSlide[]> {
  const heroDirectory = path.join(process.cwd(), "public", "images", "hero-page");
  const files = await readdir(heroDirectory, { withFileTypes: true });

  return files
    .filter(
      (file) =>
        file.isFile() &&
        supportedImageExtensions.has(path.extname(file.name).toLowerCase())
    )
    .sort((first, second) =>
      first.name.localeCompare(second.name, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    )
    .map((file, index) => ({
      src: `/images/hero-page/${encodeURIComponent(file.name)}`,
      alt: `Khoảnh khắc ${index + 1} của Đoàn Khoa Tài chính - Ngân hàng`,
    }));
}

export default async function Home() {
  const heroSlides = await getHeroSlides();

  return <HomePageClient heroSlides={heroSlides} />;
}
