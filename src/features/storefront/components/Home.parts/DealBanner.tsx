"use client";

import type { Ref } from "react";
import type { useRouter } from "next/navigation";
import type { HomeCardProduct } from "./support";
import m from "@/features/storefront/components/motion.module.css";
import { ripple, bannerMove, bannerLeave } from "@/features/storefront/components/interactions";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getDiscountPercentage, getProductImage, getPromoPlaceholderImage } from "@/features/storefront/components/Home.parts/support";


/* =========================================================
   DEAL BANNER
========================================================= */

export function DealBanner({ rawProduct, index, router, parallaxRef, userType }: { rawProduct: (Partial<HomeCardProduct> & { product?: HomeCardProduct | null }) | null | undefined; index: number; router: ReturnType<typeof useRouter>; parallaxRef: Ref<HTMLDivElement>; userType?: string }) {
  const product = rawProduct?.product || rawProduct;

  const productImage = getProductImage(product);

  const discountPercent = getDiscountPercentage(product, userType);

  const handleShopNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    ripple(e);

    const categoryName = product?.category?.name;

    if (!categoryName) return;

    router.push(`/products/?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <motion.article
      onMouseMove={bannerMove}
      onMouseLeave={bannerLeave}
      initial={{
        opacity: 0,
        y: 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.65,
        delay: 0.08 + index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="
        group
        relative
        flex
        min-w-0
        h-[220px]
        w-full
        overflow-hidden
        rounded-[18px]
        border
        border-black/[0.06]
        bg-[#eef2f4]
        shadow-[0_10px_35px_rgba(7,26,65,0.08)]
        transition-shadow
        duration-500
        hover:shadow-[0_18px_45px_rgba(7,26,65,0.14)]
        sm:h-[235px]
        md:h-[255px]
        lg:h-[275px]
        xl:h-[295px]
        [transform-style:preserve-3d]
      "
    >
      {/* IMAGE SIDE */}

      <div className="absolute inset-y-0 right-0 w-[47%] overflow-hidden sm:w-[48%] md:w-[50%]">
        <div
          ref={parallaxRef}
          className={`${m.pxFrame} absolute -inset-y-[4%] left-0 right-[-5%] h-[108%]`}
        >
          <img
            src={productImage}
            alt={product?.name || "Product"}
            className="
              h-full
              w-full
              object-cover
              object-center
              transition-transform
              duration-700
              group-hover:scale-[1.035]
            "
            onError={(e) => {
              e.currentTarget.src = getPromoPlaceholderImage();
            }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#eef2f4] via-[#eef2f4]/15 to-transparent" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220] via-[#0b1220]/95 to-transparent opacity-[0.04]" />

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          flex
          h-full
          w-[58%]
          min-w-0
          flex-col
          justify-center
          px-4
          py-5
          sm:w-[56%]
          sm:px-5
          sm:py-6
          md:w-[54%]
          md:px-6
          lg:px-7
          xl:px-8
        "
      >
        <motion.p
          initial={{
            opacity: 0,
            y: 7,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.16 + index * 0.07,
            duration: 0.45,
          }}
          className="
            font-serif
            text-[9px]
            font-medium
            italic
            tracking-[0.08em]
            text-[#6d7378]
            sm:text-[10px]
            md:text-[11px]
          "
        >
          Today&apos;s Best Deal
        </motion.p>

        <motion.h2
          initial={{
            opacity: 0,
            y: 10,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.24 + index * 0.07,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            mt-1.5
            max-w-full
            break-words
            font-serif
            text-[20px]
            font-medium
            leading-[1.08]
            tracking-[-0.025em]
            text-[#111827]
            sm:text-[23px]
            md:text-[26px]
            lg:text-[29px]
            xl:text-[32px]
          "
        >
          {product?.category?.name || product?.name}
        </motion.h2>

        <motion.p
          initial={{
            opacity: 0,
            y: 8,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.31 + index * 0.07,
            duration: 0.45,
          }}
          className="
            mt-1.5
            font-serif
            text-[12px]
            font-medium
            text-[#4b5563]
            sm:text-[13px]
            md:text-[14px]
            lg:text-[15px]
          "
        >
          {discountPercent > 0
            ? `Up to ${discountPercent}% Off!`
            : "Special Offer"}
        </motion.p>

        <motion.button
          type="button"
          initial={{
            opacity: 0,
            y: 10,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.42 + index * 0.07,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          onClick={handleShopNow}
          className="
            mt-4
            inline-flex
            h-9
            w-fit
            items-center
            justify-center
            gap-1.5
            rounded-full
            bg-[#111827]
            px-4
            text-[10px]
            font-semibold
            text-white
            shadow-[0_8px_22px_rgba(17,24,39,0.16)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:bg-[#071A41]
            sm:mt-5
            sm:h-10
            sm:px-4
            sm:text-[11px]
            md:h-11
            md:px-5
            md:text-[12px]
          "
        >
          <ArrowRight size={15} strokeWidth={2} />
        </motion.button>
      </div>

      <div
        data-spot
        className={index === 0 ? m.spot : `${m.spot} ${m.spotGold}`}
      />
    </motion.article>
  );
}
