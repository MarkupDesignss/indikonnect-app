"use client";

import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
});

interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  image: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  products_count: number;
}

interface Category {
  id: number;
  title: string;
  image: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  products_count: number;
  max_price: string;
  max_price_formatted: string;
  max_price_product: {
    id: number;
    name: string;
    product_code: string;
    retail_price: string;
    distributor_price: string;
  };
  subcategories: Subcategory[];
}

interface BannerCardProps {
  label: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  slug: string;
}

function BannerCard({
  label,
  title,
  imageSrc,
  imageAlt,
  slug,
}: BannerCardProps) {
  const handleClick = () => {
    window.location.href = `/products?subcategory=${slug}`;
  };

  return (
    <div
      onClick={handleClick}
      className="group relative h-[420px] w-full cursor-pointer overflow-hidden md:h-[520px]"
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

      {/* Text */}
      <div className="absolute bottom-8 left-6 text-white md:bottom-10 md:left-10">
        <p className="mb-1 font-sans text-xs tracking-[0.2em] md:text-sm">
          WATCHES
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
  const { data, isLoading, isError } = useGetCategoriesQuery({});

  const categories: Category[] = data?.data || [];

  // Find "All Watches" category
  const watchesCategory = categories.find(
    (category) =>
      category.id === 6 ||
      category.title.toLowerCase() === "all watches"
  );

  // Only active subcategories
  const subcategories =
    watchesCategory?.subcategories?.filter(
      (subcategory) => subcategory.status === true
    ) || [];

  if (isLoading) {
    return (
      <section className="w-full bg-white px-4 py-10 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-[420px] w-full animate-pulse bg-gray-100 md:h-[520px]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (isError || subcategories.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white px-4 py-10 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2">
        {subcategories.map((subcategory) => (
          <BannerCard
            key={subcategory.id}
            label="WATCHES"
            title={subcategory.name}
            imageSrc={subcategory.image}
            imageAlt={subcategory.name}
            slug={subcategory.slug}
          />
        ))}
      </div>
    </section>
  );
}