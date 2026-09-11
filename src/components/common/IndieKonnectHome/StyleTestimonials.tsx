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
    <section className="relative isolate flow-root w-full overflow-hidden bg-white py-8 sm:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-[1900px] px-3 sm:px-5 md:px-7 lg:px-8 xl:px-10">
        {/* Section Heading */}
        <div className="mb-8 text-center sm:mb-10">
          <h2
            className="
              font-serif
              text-[25px]
              font-medium
              leading-[1.05]
              tracking-[-0.035em]
              text-[#111111]
              sm:text-[32px]
              lg:text-[40px]
            "
          >
            Discover Your Style
          </h2>

          <div className="mx-auto mt-3 h-px w-10 bg-[#071A41]/20" />
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
            <div className="relative isolate flow-root w-full">
              {/* Previous Button */}
              <button
                type="button"
                onClick={handlePrevious}
                aria-label="Previous styles"
                className="
                  absolute
                  left-0
                  top-1/2
                  z-20
                  hidden
                  h-10
                  w-10
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-[#111111]
                  shadow-[0_6px_20px_rgba(0,0,0,0.10)]
                  transition
                  hover:scale-105
                  hover:bg-[#111111]
                  hover:text-white
                  sm:flex
                  lg:h-12
                  lg:w-12
                "
              >
                <ChevronLeft size={22} strokeWidth={1.8} />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next styles"
                className="
                  absolute
                  right-0
                  top-1/2
                  z-20
                  hidden
                  h-10
                  w-10
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-[#111111]
                  shadow-[0_6px_20px_rgba(0,0,0,0.10)]
                  transition
                  hover:scale-105
                  hover:bg-[#111111]
                  hover:text-white
                  sm:flex
                  lg:h-12
                  lg:w-12
                "
              >
                <ChevronRight size={22} strokeWidth={1.8} />
              </button>

              {/* Cards */}
              <div
                ref={sliderRef}
                className="
                  flex
                  w-full
                  items-stretch
                  gap-3
                  overflow-x-auto
                  scroll-smooth
                  px-1
                  pb-3
                  sm:gap-4
                  sm:px-8
                  md:gap-5
                  md:px-10
                  lg:px-12
                "
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {loopedCards.map((card) => (
                  <article
                    key={card._loopKey}
                    onClick={() => handleCardClick(card.slug)}
                    className="
                      group
                      relative
                      h-[300px]
                      w-[230px]
                      max-w-[230px]
                      min-w-[230px]
                      flex-shrink-0
                      cursor-pointer
                      overflow-hidden
                      rounded-[10px]
                      bg-[#f4f3ee]

                      sm:h-[360px]
                      sm:w-[270px]
                      sm:max-w-[270px]
                      sm:min-w-[270px]

                      md:h-[420px]
                      md:w-[310px]
                      md:max-w-[310px]
                      md:min-w-[310px]

                      lg:h-[470px]
                      lg:w-[350px]
                      lg:max-w-[350px]
                      lg:min-w-[350px]

                      xl:w-[390px]
                      xl:max-w-[390px]
                      xl:min-w-[390px]
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
                        object-cover
                        object-center
                        transition-transform
                        duration-700
                        ease-out
                        group-hover:scale-[1.04]
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
      </div>
    </section>
  );
}