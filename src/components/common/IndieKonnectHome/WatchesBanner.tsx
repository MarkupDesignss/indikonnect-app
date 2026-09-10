"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";

interface Subcategory {
  id: number;
  category_id: number;
  category_title?: string;
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

interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
  brands?: {
    id: number;
    title: string;
    products_count: number;
  }[];
  subcategories?: Subcategory[];
}

interface BannerCardProps {
  id: number;
  imageSrc: string;
  imageAlt: string;
  slug: string;
  productsCount: number;
  index: number;
  categoryTitle?: string;
}

function BannerCard({
  id,
  imageSrc,
  imageAlt,
  slug,
  productsCount,
  index,
  categoryTitle,
}: BannerCardProps) {
  const router = useRouter();

  /*
   * IMPORTANT:
   * ProductsPage filters by "subcategory_ids" (numeric IDs),
   * NOT by slug.
   *
   * So we navigate with:
   * /products?subcategory_ids=<id>
   *
   * We also pass ?subcategory=<slug> as a fallback for
   * any other page that may rely on slug-based routing.
   */
  const handleClick = () => {
    const params = new URLSearchParams();

    if (id) {
      params.set("subcategory_ids", String(id));
    }

    if (slug) {
      params.set("subcategory", slug);
    }

    router.push(`/products?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ perspective: "1200px" }}
      className="w-full"
    >
      <div
        onClick={handleClick}
        className="group relative h-[300px] w-full cursor-pointer overflow-hidden rounded-md shadow-md transition-shadow duration-500 hover:shadow-2xl md:h-[380px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Base image layer */}
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority={index < 2}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center grayscale transition-all duration-700 ease-out group-hover:grayscale-0"
          />
        </div>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

        {/* Shine sweep effect */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />

        {/* Border glow ring */}
        <div className="absolute inset-0 rounded-md ring-1 ring-white/0 transition-all duration-500 group-hover:ring-2 group-hover:ring-white/40" />

        {/* Category - Top Left */}
        {categoryTitle && (
          <div className="absolute left-0 top-0 p-6">
            <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
              {categoryTitle}
            </span>
          </div>
        )}

        {/* Products + Shop Now - Bottom Right */}
        <div className="absolute bottom-0 right-0 flex flex-col items-end gap-2 p-6">
          {/* Shop Now */}
          <span className="flex items-center gap-2 text-sm font-medium text-white/0 opacity-0 transition-all duration-500 group-hover:text-white/90 group-hover:opacity-100">
            Shop Now
            <svg
              className="h-4 w-4 -translate-x-2 transition-transform duration-500 group-hover:translate-x-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-md bg-gray-100 md:h-[380px]">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export default function WatchesBanner() {
  const { data, isLoading, isError } = useGetCategoriesQuery({});

  const response = data as CategoriesResponse | undefined;

  const categories: Category[] = response?.data || [];

  /*
   * API mein subcategories do jagah mil sakti hain:
   *
   * 1. data[].subcategories
   * 2. top-level data.subcategories
   *
   * Dono ko combine karke unique subcategories show kar rahe hain.
   */
  const nestedSubcategories: Subcategory[] = categories.flatMap(
    (category) =>
      (category.subcategories || []).map((subcategory) => ({
        ...subcategory,
        category_title: category.title,
      }))
  );

  const topLevelSubcategories: Subcategory[] =
    response?.subcategories || [];

  /*
   * Nested + top-level subcategories combine
   * aur duplicate IDs remove.
   */
  const allSubcategories: Subcategory[] = [
    ...nestedSubcategories,
    ...topLevelSubcategories,
  ]
    .filter((subcategory) => subcategory.status === true)
    .filter(
      (subcategory, index, self) =>
        index === self.findIndex((item) => item.id === subcategory.id)
    );

  /*
   * ✅ PRIORITY LOGIC:
   * Pehle "him" wali subcategory, phir "her" wali.
   *
   * - "him" ya "men" ya "male" → pehli priority
   * - "her" ya "women" ya "female" → doosri priority
   * - Baaki sab → baad mein
   * - End mein sirf pehli 2 hi dikhao.
   */
  const himKeywords = ["him", "men", "male"];
  const herKeywords = ["her", "women", "female"];

  const matchesKeyword = (subcategory: Subcategory, keywords: string[]) => {
    const name = subcategory.name?.toLowerCase() || "";
    const slug = subcategory.slug?.toLowerCase() || "";
    return keywords.some(
      (keyword) => name.includes(keyword) || slug.includes(keyword)
    );
  };

  const himSubcategories = allSubcategories.filter((sub) =>
    matchesKeyword(sub, himKeywords)
  );
  const herSubcategories = allSubcategories.filter(
    (sub) =>
      !matchesKeyword(sub, himKeywords) && matchesKeyword(sub, herKeywords)
  );
  const otherSubcategories = allSubcategories.filter(
    (sub) =>
      !matchesKeyword(sub, himKeywords) && !matchesKeyword(sub, herKeywords)
  );

  /*
   * Order: Him → Her → Others
   * Fir sirf pehli 2 hi dikhani hai.
   */
  const sortedSubcategories = [
    ...himSubcategories,
    ...herSubcategories,
    ...otherSubcategories,
  ];

  const displayedSubcategories = sortedSubcategories.slice(0, 2);

  if (isLoading) {
    return (
      <section className="w-full bg-white px-4 py-7 md:px-8">
        <div className="mx-auto grid max-w-[1400] grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((item) => (
            <SkeletonCard key={item} />
          ))}
        </div>
      </section>
    );
  }

  if (isError || displayedSubcategories.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white px-4 py-7 md:px-8">
      <div className="mx-auto grid max-w-[1400] grid-cols-1 gap-4 md:grid-cols-2">
        {displayedSubcategories.map((subcategory, index) => (
          <BannerCard
            key={subcategory.id}
            id={subcategory.id}
            imageSrc={subcategory.image}
            imageAlt={subcategory.name}
            slug={subcategory.slug}
            productsCount={subcategory.products_count}
            categoryTitle={subcategory.category_title}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}