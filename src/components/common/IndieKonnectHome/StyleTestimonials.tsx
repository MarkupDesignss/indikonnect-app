"use client";

import React, { useMemo, useRef, useEffect } from "react";
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

  const isJumpingRef = useRef(false);

  const { data, isLoading, isError } = useGetContentsQuery();

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

    // Find Discover Your Style section
    const discoverStyleItem = items.find(
      (item) =>
        item?.slug === "discover-your-style" ||
        item?.title === "Discover Your Style" ||
        item?.id === 42
    );

    // Extract cards from blocks
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
            block.heading?.toLowerCase().replace(/\s+/g, "-") ?? "",
        }))
        .filter(
          (item: StyleCard) =>
            Boolean(item.image) && Boolean(item.title)
        );
    }

    // Fallback: find blocks from any content
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
              block.heading?.toLowerCase().replace(/\s+/g, "-") ?? "",
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

    // Last fallback
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
          Boolean(item.title) &&
          Boolean(item.slug)
      );
  }, [data]);

  // Triplicate cards for infinite scrolling
  const loopedCards: (StyleCard & { _loopKey: string })[] = useMemo(() => {
    if (styleCards.length === 0) return [];

    return [
      ...styleCards.map((c) => ({
        ...c,
        _loopKey: `pre-${c.id}`,
      })),
      ...styleCards.map((c) => ({
        ...c,
        _loopKey: `orig-${c.id}`,
      })),
      ...styleCards.map((c) => ({
        ...c,
        _loopKey: `post-${c.id}`,
      })),
    ];
  }, [styleCards]);

  // Start from the original middle set
  useEffect(() => {
    const container = sliderRef.current;

    if (!container || styleCards.length === 0) return;

    const setId = requestAnimationFrame(() => {
      const singleSetWidth = container.scrollWidth / 3;

      isJumpingRef.current = true;
      container.scrollLeft = singleSetWidth;

      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
    });

    return () => cancelAnimationFrame(setId);
  }, [styleCards.length]);

  // Infinite loop scroll handling
  useEffect(() => {
    const container = sliderRef.current;

    if (!container || styleCards.length === 0) return;

    const handleScroll = () => {
      if (isJumpingRef.current) return;

      const singleSetWidth = container.scrollWidth / 3;
      const { scrollLeft } = container;

      // Too far left
      if (scrollLeft < singleSetWidth * 0.5) {
        isJumpingRef.current = true;

        container.scrollLeft = scrollLeft + singleSetWidth;

        requestAnimationFrame(() => {
          isJumpingRef.current = false;
        });
      }

      // Too far right
      else if (scrollLeft > singleSetWidth * 1.5) {
        isJumpingRef.current = true;

        container.scrollLeft = scrollLeft - singleSetWidth;

        requestAnimationFrame(() => {
          isJumpingRef.current = false;
        });
      }
    };

    container.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [styleCards.length]);

  const handlePrevious = () => {
    sliderRef.current?.scrollBy({
      left: -390,
      behavior: "smooth",
    });
  };

  const handleNext = () => {
    sliderRef.current?.scrollBy({
      left: 390,
      behavior: "smooth",
    });
  };

  const handleCardClick = (slug: string) => {
    if (!slug) return;

    router.push(`/products?slug=${encodeURIComponent(slug)}`);
  };

  return (
    <section className="w-full overflow-hidden bg-white py-6 md:py-16">
      {/* Section Heading */}
      <div className="mb-7 text-center md:mb-9">
        <h2
          className="
            font-serif
            text-[28px]
            font-normal
            uppercase
            leading-none
            tracking-[-0.02em]
            text-[#252525]
            sm:text-[32px]
            md:text-[35px]
            lg:text-[38px]
          "
        >
          Discover Your Style
        </h2>
      </div>

      {/* Loading */}
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

      {/* Error */}
      {isError && !isLoading && (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-gray-500">
            Unable to load styles. Please try again later.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading &&
        !isError &&
        styleCards.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-gray-500">
              No styles available at the moment.
            </p>
          </div>
        )}

      {/* Slider */}
      {!isLoading &&
        !isError &&
        styleCards.length > 0 && (
          <div className="relative w-full">
            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous styles"
              className="
                absolute
                left-[3.5%]
                top-1/2
                z-20
                flex
                h-[54px]
                w-[54px]
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white
                text-[#1f1f1f]
                shadow-sm
                transition-transform
                duration-200
                hover:scale-105
                active:scale-95
              "
            >
              <ChevronLeft size={31} strokeWidth={2} />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next styles"
              className="
                absolute
                right-[3.5%]
                top-1/2
                z-20
                flex
                h-[54px]
                w-[54px]
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white
                text-[#1f1f1f]
                shadow-sm
                transition-transform
                duration-200
                hover:scale-105
                active:scale-95
              "
            >
              <ChevronRight size={31} strokeWidth={2} />
            </button>

            {/* Cards */}
            <div
              ref={sliderRef}
              className="
                flex
                w-full
                gap-[18px]
                overflow-x-auto
                px-[5%]
                pb-2
                scroll-smooth
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {loopedCards.map((card) => (
                <article
                  key={card._loopKey}
                  onClick={() => handleCardClick(card.slug)}
                  className="
                    group
                    relative
                    h-[385px]
                    w-[calc((100vw-10%)/3.5)]
                    min-w-[calc((100vw-10%)/3.5)]
                    flex-shrink-0
                    cursor-pointer
                    overflow-hidden
                    bg-[#eeeeee]

                    sm:h-[420px]

                    md:h-[450px]

                    lg:h-[470px]
                  "
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-
                      object-center
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-[1.02]
                    "
                  />

                  {/* Bottom Gradient */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-x-0
                      bottom-0
                      h-[150px]
                      bg-gradient-to-t
                      from-black/30
                      via-black/5
                      to-transparent
                    "
                  />
                </article>
              ))}
            </div>
          </div>
        )}
    </section>
  );
}