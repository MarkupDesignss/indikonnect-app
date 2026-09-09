
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
});

interface BannerCardProps {
  label: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
}

function BannerCard({
  label,
  title,
  imageSrc,
  imageAlt,
}: BannerCardProps) {
  return (
    <div className="relative h-[420px] w-full cursor-pointer overflow-hidden group md:h-[520px]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* Text content */}
      <div className="absolute bottom-8 left-6 text-white md:bottom-10 md:left-10">
        <p className="mb-1 font-sans text-xs tracking-wide md:text-sm">
          {label}
        </p>

        <h2
          className={`${playfair.className} text-3xl font-medium italic leading-tight md:text-5xl`}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}

export default function WatchesBanner() {
  return (
    <section className="w-full bg-white px-4 py-10 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2">
        <BannerCard
          label="WATCHES"
          title="For Him"
          imageSrc="https://your-domain.com/images/watch-for-him.jpg"
          imageAlt="Man wearing a wristwatch"
        />

        <BannerCard
          label="WATCHES"
          title="For Her"
          imageSrc="https://your-domain.com/images/watch-for-her.jpg"
          imageAlt="Woman wearing a wristwatch"
        />
      </div>
    </section>
  );
}

