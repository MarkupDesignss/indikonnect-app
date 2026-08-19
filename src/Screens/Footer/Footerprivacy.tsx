"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useGetContentsQuery } from "@/lib/redux/api/Home/contentApi";

interface ContentBlock {
  id: number;
  heading: string;
  short_description: string | null;
  description: string;
  sort_order: number;
  images: Array<{
    id: number;
    url: string;
    alt_text: string | null;
    is_primary: boolean;
  }>;
  videos: any[];
}

interface ContentData {
  id: number;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
  blocks: ContentBlock[];
}

interface FooterPolicyClientProps {
  slug: string;
}

export default function FooterPolicyClient({
  slug,
}: FooterPolicyClientProps) {
  const {
    data: contentsData,
    isLoading,
    error,
  } = useGetContentsQuery({});

  const [content, setContent] =
    useState<ContentData | null>(null);

  useEffect(() => {
    if (!contentsData?.data || !slug) {
      setContent(null);
      return;
    }

    const found = contentsData.data.find(
      (item: ContentData) =>
        item.slug?.toLowerCase() === slug.toLowerCase()
    );

    setContent(found || null);
  }, [contentsData, slug]);

  const createMarkup = (html: string) => ({
    __html: html,
  });

  const renderHeading = (heading: string) => {
    if (!heading) return null;

    if (
      heading.includes("<h1") ||
      heading.includes("<h2") ||
      heading.includes("<h3") ||
      heading.includes("<h4")
    ) {
      return (
        <div
          dangerouslySetInnerHTML={createMarkup(heading)}
        />
      );
    }

    const cleanText = heading
      .replace(/<h[1-4]>/gi, "")
      .replace(/<\/h[1-4]>/gi, "")
      .trim();

    return (
      <h3 className="text-[#1a1a2e] font-bold tracking-[-0.01em]">
        {cleanText}
      </h3>
    );
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-[6px] sm:p-5">
      <div className="relative flex max-h-[94vh] w-full max-w-[1050px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_100px_rgba(0,0,0,0.35)] md:rounded-3xl">

        {/* Close */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/70"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-[500px] flex-1 flex-col items-center justify-center gap-5">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f9c744] border-t-transparent" />

            <p className="text-[15px] text-[#9a97b0]">
              Loading content...
            </p>
          </div>
        )}

        {/* Error */}
        {!isLoading && (error || !content) && (
          <div className="flex min-h-[500px] flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-6xl">📄</span>

            <h2 className="text-3xl font-bold text-[#1a1a2e]">
              Content Not Found
            </h2>

            <p className="max-w-[420px] text-[#6b6882]">
              The requested policy could not be found.
            </p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && content && (
          <div className="min-h-0 flex-1 overflow-y-auto">

            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#2d2b4a] to-[#3d3a5c] px-6 py-16 text-center sm:px-8 sm:py-20">

              <div className="absolute -right-[20%] -top-[50%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(249,199,68,0.08)_0%,transparent_70%)]" />

              <div className="absolute -bottom-[30%] -left-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,123,191,0.06)_0%,transparent_70%)]" />

              <div className="relative z-10 mx-auto max-w-[800px]">
                <span className="mb-5 inline-block rounded-full border border-[rgba(249,199,68,0.2)] bg-[rgba(249,199,68,0.15)] px-5 py-1.5 text-[13px] font-semibold uppercase tracking-[2px] text-[#f9c744]">
                  Policy
                </span>

                <h1 className="mb-4 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.15] text-white">
                  {content.title}
                </h1>

                <p className="text-[15px] text-white/60">
                  Last updated:{" "}
                  {new Date(
                    content.updated_at
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f9c744] via-[#8b7bbf] via-[#c44a6a] to-[#4bbf8a] to-[#f9c744]" />
            </div>

            {/* Blocks */}
            <div className="mx-auto max-w-[880px] px-4 py-6 pb-10 sm:px-6 sm:py-10">
              {content.blocks.map((block) => (
                <div
                  key={block.id}
                  className="mb-6 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.04)] sm:mb-8 sm:rounded-3xl sm:p-10"
                >
                  {block.heading && (
                    <div className="mb-5">
                      {renderHeading(block.heading)}
                    </div>
                  )}

                  {block.short_description && (
                    <div className="mb-6 text-[#6b6882]">
                      <div
                        dangerouslySetInnerHTML={createMarkup(
                          block.short_description
                        )}
                      />
                    </div>
                  )}

                  {block.description && (
                    <div className="policy-content">
                      <div
                        dangerouslySetInnerHTML={createMarkup(
                          block.description
                        )}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .policy-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.2;
          margin-bottom: 0.5rem;
        }

        .policy-content h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.25;
          margin-bottom: 0.5rem;
        }

        .policy-content h3 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.3;
          margin-bottom: 0.5rem;
        }

        .policy-content h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #6b6882;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }

        .policy-content p {
          font-size: 1rem;
          line-height: 1.8;
          color: #6b6882;
          margin-bottom: 1rem;
        }

        .policy-content ul {
          padding: 0;
          margin: 1rem 0 1.25rem;
          list-style: none;
        }

        .policy-content li {
          position: relative;
          padding: 0.5rem 0 0.5rem 1.75rem;
          font-size: 1rem;
          line-height: 1.7;
          color: #6b6882;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .policy-content li:last-child {
          border-bottom: none;
        }

        .policy-content li::before {
          content: "✦";
          position: absolute;
          left: 0;
          top: 0.5rem;
          color: #f9c744;
        }

        .policy-content strong {
          color: #1a1a2e;
          font-weight: 600;
        }

        .policy-content a {
          color: #8b7bbf;
          text-decoration: none;
        }

        .policy-content a:hover {
          color: #e8a82c;
        }

        @media (max-width: 768px) {
          .policy-content h1 {
            font-size: 1.75rem;
          }

          .policy-content h2 {
            font-size: 1.4rem;
          }

          .policy-content h3 {
            font-size: 1.15rem;
          }

          .policy-content p,
          .policy-content li {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}