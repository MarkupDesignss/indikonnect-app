"use client";

import React, { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetContentsQuery } from "@/lib/redux/api/Home/contentApi";

interface StyleCard {
  id: number | string;
  image: string;
  title: string;
  slug: string;
}

export default function StyleTestimonials() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data, isLoading, isError } = useGetContentsQuery();

  // =========================================================
  // GET STYLE CARDS
  // =========================================================

  const styleCards: StyleCard[] = useMemo(() => {
    if (!data) {
      return [];
    }

    const responseData = (data as any)?.data ?? data;

    let items: any[] = [];

    if (Array.isArray(responseData)) {
      items = responseData;
    } else if (Array.isArray(responseData?.items)) {
      items = responseData.items;
    } else if (Array.isArray(responseData?.contents)) {
      items = responseData.contents;
    } else {
      const possibleArray = Object.values(responseData || {}).find(
        (value) => Array.isArray(value) && value.length > 0
      );

      if (Array.isArray(possibleArray)) {
        items = possibleArray;
      }
    }

    // =======================================================
    // FIND DISCOVER YOUR STYLE
    // =======================================================

    const discoverStyleItem = items.find(
      (item) =>
        item?.slug === "discover-your-style" ||
        item?.title === "Discover Your Style" ||
        item?.id === 42
    );

    // =======================================================
    // GET BLOCKS
    // =======================================================

    if (
      discoverStyleItem?.blocks &&
      Array.isArray(discoverStyleItem.blocks)
    ) {
      return discoverStyleItem.blocks
        .map((block: any) => ({
          id: block.id,
          image: block.images?.[0]?.url ?? "",
          title: block.heading ?? "",
          slug:
            block.slug ??
            block.heading?.toLowerCase().replace(/\s+/g, "-") ??
            "",
        }))
        .filter(
          (item: StyleCard) =>
            Boolean(item.image) && Boolean(item.title)
        );
    }

    // =======================================================
    // FALLBACK BLOCK SEARCH
    // =======================================================

    for (const item of items) {
      if (
        item?.blocks &&
        Array.isArray(item.blocks) &&
        item.blocks.length > 0
      ) {
        const mappedBlocks = item.blocks
          .map((block: any) => ({
            id: block.id,
            image: block.images?.[0]?.url ?? "",
            title: block.heading ?? "",
            slug:
              block.slug ??
              block.heading?.toLowerCase().replace(/\s+/g, "-") ??
              "",
          }))
          .filter(
            (item: StyleCard) =>
              Boolean(item.image) && Boolean(item.title)
          );

        if (mappedBlocks.length > 0) {
          return mappedBlocks;
        }
      }
    }

    // =======================================================
    // LAST FALLBACK
    // =======================================================

    return items
      .map((item, index) => ({
        id: item?.id ?? item?._id ?? index,
        image:
          item?.image ??
          item?.image_url ??
          item?.thumbnail ??
          "",
        title:
          item?.title ??
          item?.name ??
          item?.heading ??
          "",
        slug: item?.slug ?? "",
      }))
      .filter(
        (item) =>
          Boolean(item.image) &&
          Boolean(item.title)
      );
  }, [data]);

  // =========================================================
  // PREVIOUS
  // =========================================================

  const handlePrevious = () => {
    sliderRef.current?.scrollBy({
      left: -430,
      behavior: "smooth",
    });
  };

  // =========================================================
  // NEXT
  // =========================================================

  const handleNext = () => {
    sliderRef.current?.scrollBy({
      left: 430,
      behavior: "smooth",
    });
  };

  // =========================================================
  // CARD CLICK
  // =========================================================

  const handleCardClick = (slug: string) => {
    if (!slug) {
      return;
    }

    router.push(
      `/products?slug=${encodeURIComponent(slug)}`
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <section
      className="
        relative
        isolate
        w-full
        overflow-hidden
        bg-white
        py-8
        sm:py-10
        lg:py-12
      "
    >
      {/* =====================================================
          7XL CONTAINER
      ====================================================== */}

      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* ===================================================
            HEADING
        ==================================================== */}

        <div className="mb-8 text-center sm:mb-9 lg:mb-10">
          <h2
            className="
              font-serif
              text-[27px]
              font-medium
              leading-none
              tracking-[-0.035em]
              text-[#111111]
              sm:text-[31px]
              lg:text-[35px]
              xl:text-[38px]
            "
          >
            Discover Your Style
          </h2>

          <div
            className="
              mx-auto
              mt-3
              h-px
              w-10
              bg-[#071A41]/20
            "
          />
        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}

        {isLoading && (
          <div className="flex justify-center py-12">
            <div
              className="
                h-8
                w-8
                animate-spin
                rounded-full
                border-2
                border-[#222]
                border-t-transparent
              "
            />
          </div>
        )}

        {/* ===================================================
            ERROR
        ==================================================== */}

        {isError && !isLoading && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-gray-500">
              Unable to load styles. Please try again later.
            </p>
          </div>
        )}

        {/* ===================================================
            EMPTY
        ==================================================== */}

        {!isLoading &&
          !isError &&
          styleCards.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-gray-500">
                No styles available at the moment.
              </p>
            </div>
          )}

        {/* ===================================================
            SLIDER
        ==================================================== */}

        {!isLoading &&
          !isError &&
          styleCards.length > 0 && (
            <div className="relative w-full">

              {/* =================================================
                  PREVIOUS BUTTON
              ================================================== */}

              <button
                type="button"
                onClick={handlePrevious}
                aria-label="Previous styles"
                className="
                  absolute
                  left-0
                  top-1/2
                  z-30
                  hidden
                  h-11
                  w-11
                  -translate-x-1/2
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-[#111111]
                  shadow-[0_5px_20px_rgba(0,0,0,0.14)]
                  transition-all
                  duration-200
                  hover:scale-105
                  hover:bg-[#111111]
                  hover:text-white
                  sm:flex
                  lg:h-12
                  lg:w-12
                "
              >
                <ChevronLeft
                  size={22}
                  strokeWidth={1.8}
                />
              </button>

              {/* =================================================
                  NEXT BUTTON
              ================================================== */}

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next styles"
                className="
                  absolute
                  right-0
                  top-1/2
                  z-30
                  hidden
                  h-11
                  w-11
                  translate-x-1/2
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-[#111111]
                  shadow-[0_5px_20px_rgba(0,0,0,0.14)]
                  transition-all
                  duration-200
                  hover:scale-105
                  hover:bg-[#111111]
                  hover:text-white
                  sm:flex
                  lg:h-12
                  lg:w-12
                "
              >
                <ChevronRight
                  size={22}
                  strokeWidth={1.8}
                />
              </button>

              {/* =================================================
                  CARDS
              ================================================== */}

              <div
                ref={sliderRef}
                className="
                  flex
                  w-full
                  items-stretch
                  gap-4
                  overflow-x-auto
                  scroll-smooth
                  pb-2

                  sm:gap-5
                  lg:gap-5
                "
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {styleCards.map((card) => (
                  <article
                    key={card.id}
                    onClick={() =>
                      handleCardClick(card.slug)
                    }
                    className="
                      group
                      relative
                      h-[330px]
                      min-w-[270px]
                      max-w-[270px]
                      flex-shrink-0
                      cursor-pointer
                      overflow-hidden
                      bg-[#f4f3ee]

                      sm:h-[390px]
                      sm:min-w-[320px]
                      sm:max-w-[320px]

                      md:h-[440px]
                      md:min-w-[350px]
                      md:max-w-[350px]

                      lg:h-[480px]
                      lg:min-w-[365px]
                      lg:max-w-[365px]

                      xl:h-[510px]
                      xl:min-w-[370px]
                      xl:max-w-[370px]
                    "
                  >
                    {/* =========================================
                        IMAGE
                    ========================================== */}

                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      draggable={false}
                      className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-cover
                        object-center
                        transition-transform
                        duration-700
                        ease-out
                        group-hover:scale-[1.035]
                      "
                    />
                  </article>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* =====================================================
          HIDE SCROLLBAR
      ====================================================== */}

    
    </section>
  );
}