
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

/* =========================================================
   BANNER CARD
========================================================= */

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

  const handleClick = () => {
    const params = new URLSearchParams();

    if (id) {
      params.set("subcategory_ids", String(id));
    }

    if (slug) {
      params.set("subcategory", slug);
    }

    router.push(`/ products ? ${params.toString()} `);
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 24,
        scale: 0.97,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="min-w-0 w-full"
    >
      <div
        onClick={handleClick}
        style={{
          transformStyle: "preserve-3d",
        }}
        className="
    group
    relative
    w-full
    cursor-pointer
    overflow-hidden
    rounded-[9px]
    bg-[#eeeeee]
    shadow-[0_5px_18px_rgba(0,0,0,0.08)]
    ring-1
    ring-black/[0.05]

    /* MOBILE */
    min-h-[135px]
    aspect-[1.12/1]

    /* 375px+ */
    min-[375px]:min-h-[145px]
    min-[375px]:aspect-[1.18/1]

    /* SMALL TABLET */
    sm:min-h-[190px]
    sm:aspect-[1.35/1]

    /* TABLET */
    md:min-h-[230px]
    md:aspect-[1.45/1]

    /* DESKTOP */
    lg:min-h-[280px]
    lg:aspect-[1.5/1]

    /* LARGE DESKTOP */
    xl:min-h-[320px]
    xl:aspect-[1.6/1]

    transition-all
    duration-500
    hover:-translate-y-1
    hover:shadow-[0_16px_35px_rgba(0,0,0,0.14)]
  "
      >
        {/* IMAGE */}
        <div className="relative w-full overflow-hidden">
          <Image
            src={imageSrc || "/images/placeholder.png"}
            alt={imageAlt || "Banner"}
            width={1200}
            height={600}
            priority={index < 2}
            sizes="100vw"
            className="
      block
      w-full
      h-auto
      object-cover
      object-center
      transition-transform
      duration-700
      ease-out
      group-hover:scale-[1.06]
    "
            onError={(event) => {
              event.currentTarget.src = "/images/placeholder.png";
            }}
          />
        </div>

        {/* OVERLAY */}
        <div
          className="
      pointer-events-none
      absolute
      inset-0
      bg-gradient-to-t
      from-black/80
      via-black/30
      to-black/5
    "
        />

        {/* TOP CATEGORY */}
        {categoryTitle && (
          <div
            className="
        absolute
        left-2
        top-2
        z-10

        sm:left-3
        sm:top-3

        lg:left-4
        lg:top-4
      "
          >
            <span
              className="
          inline-flex
          max-w-[calc(100vw/2-25px)]
          truncate
          rounded-full
          border
          border-white/20
          bg-black/20
          px-2
          py-1
          text-[6px]
          font-medium
          uppercase
          tracking-[0.10em]
          text-white
          backdrop-blur-md

          min-[375px]:text-[7px]

          sm:px-2.5
          sm:text-[8px]

          lg:px-3
          lg:py-1.5
          lg:text-[9px]
        "
            >
              {categoryTitle}
            </span>
          </div>
        )}

        {/* BOTTOM CONTENT */}
        <div
          className="
      absolute
      inset-x-0
      bottom-0
      z-10

      flex
      items-end
      justify-between

      gap-1

      px-2
      pb-2
      pt-6

      min-[375px]:px-2.5
      min-[375px]:pb-2.5

      sm:px-3
      sm:pb-3

      lg:px-4
      lg:pb-4
    "
        >
          {/* LEFT */}
          <div className="min-w-0 flex-1">
            <div
              className="
          truncate
          text-[6px]
          uppercase
          tracking-[0.05em]
          text-white/70

          min-[375px]:text-[7px]

          sm:text-[8px]

          lg:text-[9px]
        "
            >
              {/* {productsCount > 0
                ? `${productsCount} Products`
                : "Explore Collection"} */}
            </div>

            {/* <h3
              className="
          mt-[1px]
          truncate
          text-[10px]
          font-semibold
          leading-tight
          text-white

          min-[375px]:text-[11px]

          sm:text-[13px]

          md:text-[15px]

          lg:text-[17px]
        "
            >
              {imageAlt}
            </h3> */}
          </div>

          {/* RIGHT */}
          <div
            className="
        flex
        shrink-0
        items-center
        gap-1
        pb-[1px]
        text-[6px]
        font-medium
        uppercase
        tracking-[0.05em]
        text-white/90

        min-[375px]:text-[7px]

        sm:text-[8px]

        lg:text-[9px]
      "
          >
            <span>Shop</span>

            <svg
              className="
          h-2.5
          w-2.5
          transition-transform
          duration-300
          group-hover:translate-x-1

          sm:h-3
          sm:w-3

          lg:h-3.5
          lg:w-3.5
        "
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function SkeletonCard() {
  return (
    <div
      className="
        relative
        aspect-[1.45/1]
        w-full
        overflow-hidden
        rounded-[10px]
        bg-gray-100

        min-[360px]:aspect-[1.5/1]

        sm:aspect-[1.55/1]

        lg:aspect-[1.6/1]

        xl:aspect-[1.7/1]
      "
    >
      <div
        className="
          absolute
          inset-0
          -translate-x-full
          animate-[shimmer_1.6s_infinite]
          bg-gradient-to-r
          from-transparent
          via-white/70
          to-transparent
        "
      />
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function WatchesBanner() {
  const {
    data,
    isLoading,
    isError,
  } = useGetCategoriesQuery({});

  const response =
    data as CategoriesResponse | undefined;

  const categories: Category[] =
    response?.data || [];

  /* =======================================================
     NESTED SUBCATEGORIES
  ======================================================= */

  const nestedSubcategories: Subcategory[] =
    categories.flatMap((category) =>
      (category.subcategories || []).map(
        (subcategory) => ({
          ...subcategory,
          category_title: category.title,
        })
      )
    );

  /* =======================================================
     TOP LEVEL SUBCATEGORIES
  ======================================================= */

  const topLevelSubcategories: Subcategory[] =
    response?.subcategories || [];

  /* =======================================================
     COMBINE + REMOVE DUPLICATES
  ======================================================= */

  const allSubcategories: Subcategory[] = [
    ...nestedSubcategories,
    ...topLevelSubcategories,
  ]
    .filter(
      (subcategory) =>
        subcategory.status === true
    )
    .filter(
      (subcategory, index, self) =>
        index ===
        self.findIndex(
          (item) =>
            item.id === subcategory.id
        )
    );

  /* =======================================================
     PRIORITY
     HIM -> HER -> OTHERS
  ======================================================= */

  const himKeywords = [
    "him",
    "men",
    "male",
  ];

  const herKeywords = [
    "her",
    "women",
    "female",
  ];

  const matchesKeyword = (
    subcategory: Subcategory,
    keywords: string[]
  ) => {
    const name =
      subcategory.name?.toLowerCase() || "";

    const slug =
      subcategory.slug?.toLowerCase() || "";

    return keywords.some(
      (keyword) =>
        name.includes(keyword) ||
        slug.includes(keyword)
    );
  };

  const himSubcategories =
    allSubcategories.filter((sub) =>
      matchesKeyword(sub, himKeywords)
    );

  const herSubcategories =
    allSubcategories.filter(
      (sub) =>
        !matchesKeyword(sub, himKeywords) &&
        matchesKeyword(sub, herKeywords)
    );

  const otherSubcategories =
    allSubcategories.filter(
      (sub) =>
        !matchesKeyword(sub, himKeywords) &&
        !matchesKeyword(sub, herKeywords)
    );

  /* =======================================================
     FINAL ORDER
  ======================================================= */

  const sortedSubcategories = [
    ...himSubcategories,
    ...herSubcategories,
    ...otherSubcategories,
  ];

  /* =======================================================
     ONLY TWO BANNERS
  ======================================================= */

  const displayedSubcategories =
    sortedSubcategories.slice(0, 2);

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <section
        className="
          w-full
          bg-white
          px-2
          py-4

          min-[360px]:px-2.5
          min-[360px]:py-5

          sm:px-5
          sm:py-7

          md:px-6

          lg:px-8
          lg:py-10

          xl:px-10
        "
      >
        <div
          className="
            mx-auto
            grid
            w-full
            max-w-[1600px]

            grid-cols-2

            gap-2

            min-[360px]:gap-2.5

            sm:gap-4

            md:gap-5

            lg:gap-6
          "
        >
          {[1, 2].map((item) => (
            <SkeletonCard
              key={item}
            />
          ))}
        </div>
      </section>
    );
  }

  /* =======================================================
     ERROR / EMPTY
  ======================================================= */

  if (
    isError ||
    displayedSubcategories.length === 0
  ) {
    return null;
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section
      className="
        w-full
        bg-white
        px-2
        py-4

        min-[360px]:px-2.5
        min-[360px]:py-5

        sm:px-5
        sm:py-7

        md:px-6
        md:py-8

        lg:px-8
        lg:py-10

        xl:px-10
      "
    >
      <div
        className="
          mx-auto
          grid
          w-full
          max-w-[1600px]

          /* ALWAYS TWO COLUMNS */
          grid-cols-2

          gap-2

          min-[360px]:gap-2.5

          sm:gap-4

          md:gap-5

          lg:gap-6

          xl:gap-7
        "
      >
        {displayedSubcategories.map(
          (subcategory, index) => (
            <BannerCard
              key={subcategory.id}
              id={subcategory.id}
              imageSrc={
                subcategory.image
              }
              imageAlt={
                subcategory.name
              }
              slug={
                subcategory.slug
              }
              productsCount={
                subcategory.products_count
              }
              categoryTitle={
                subcategory.category_title
              }
              index={index}
            />
          )
        )}
      </div>
    </section>
  );
}

