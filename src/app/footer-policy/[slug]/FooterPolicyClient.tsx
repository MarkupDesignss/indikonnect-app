
"use client";

import Header from "@/components/common/Header";
import Footer from "@/components/Footer/Footer";
import {
  useGetFAQsQuery,
} from "@/lib/redux/api/faqApi";
import {
  useGetContentsQuery,
} from "@/lib/redux/api/Home/contentApi";
import { useParams } from "next/navigation";
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import parse from "html-react-parser";

/* =========================================================
   CONTENT TYPES
========================================================= */

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

/* =========================================================
   FAQ TYPES
========================================================= */

interface FAQSection {
  id: number;
  name: string;
  slug: string;
}

interface FAQItem {
  id: number;
  section_id: number;
  question: string;
  answer: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  section?: FAQSection;
}

interface FAQMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface FAQResponse {
  success: boolean;
  data: FAQItem[];
  meta: FAQMeta;
}

/* =========================================================
   HTML HELPERS
========================================================= */

function decodeHtmlEntities(value: string): string {
  if (!value) {
    return "";
  }

  let result = value;

  for (let i = 0; i < 3; i += 1) {
    const textarea =
      document.createElement("textarea");

    textarea.innerHTML = result;

    const decoded = textarea.value;

    if (decoded === result) {
      break;
    }

    result = decoded;
  }

  return result.replace(/\u00a0/g, " ");
}

/* =========================================================
   NORMALIZE EDITOR HTML

   Fixes API content like:

   <p>&lt;table&gt;</p>
   <p>&lt;thead&gt;</p>

   into actual table HTML.
========================================================= */

function normalizeHtml(value: string): string {
  if (!value) {
    return "";
  }

  let html = decodeHtmlEntities(value);

  /*
   * Remove paragraph wrappers around table tags.
   */

  html = html.replace(
    /<p>\s*(?=<(?:table|thead|tbody|tfoot|tr|th|td)\b)/gi,
    ""
  );

  html = html.replace(
    /<\/p>\s*(?=<\/?(?:table|thead|tbody|tfoot|tr|th|td)\b)/gi,
    ""
  );

  html = html.replace(
    /(<\/?(?:table|thead|tbody|tfoot|tr|th|td)\b[^>]*>)\s*<\/p>/gi,
    "$1"
  );

  /*
   * Remove empty editor paragraphs.
   */

  html = html.replace(
    /<p>\s*(?:&nbsp;|\s)*<\/p>/gi,
    ""
  );

  /*
   * Remove unnecessary whitespace before/after table markup.
   */

  html = html.replace(
    /<p>\s*<\/p>/gi,
    ""
  );

  return html.trim();
}

/* =========================================================
   SAFE HTML COMPONENT
========================================================= */

interface SafeHtmlProps {
  html: string;
  className?: string;
}

function SafeHtml({
  html,
  className = "",
}: SafeHtmlProps) {
  const [cleanHtml, setCleanHtml] =
    useState<string>("");

  useEffect(() => {
    let mounted = true;

    const sanitize = async () => {
      try {
        const {
          default: DOMPurify,
        } = await import("dompurify");

        const normalized =
          normalizeHtml(html);

        const sanitized =
          DOMPurify.sanitize(
            normalized,
            {
              ALLOWED_TAGS: [
                "p",
                "br",
                "strong",
                "b",
                "em",
                "i",
                "u",
                "s",
                "ul",
                "ol",
                "li",
                "a",
                "table",
                "thead",
                "tbody",
                "tfoot",
                "tr",
                "th",
                "td",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "blockquote",
                "div",
                "span",
                "hr",
              ],

              ALLOWED_ATTR: [
                "href",
                "target",
                "rel",
                "colspan",
                "rowspan",
                "scope",
              ],

              ALLOW_UNKNOWN_PROTOCOLS: false,
            }
          );

        if (mounted) {
          setCleanHtml(sanitized);
        }
      } catch (error) {
        console.error(
          "HTML sanitize error:",
          error
        );

        if (mounted) {
          setCleanHtml("");
        }
      }
    };

    sanitize();

    return () => {
      mounted = false;
    };
  }, [html]);

  if (!cleanHtml) {
    return null;
  }

  return (
    <div className={className}>
      {parse(cleanHtml, {
        replace: (domNode: any) => {
          /*
           * Make external links open safely.
           */

          if (
            domNode?.type === "tag" &&
            domNode?.name === "a"
          ) {
            const href =
              domNode?.attribs?.href || "";

            const isExternal =
              href.startsWith("http://") ||
              href.startsWith("https://");

            if (isExternal) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="safe-html-link"
                >
                  {parse(
                    domNode?.children
                      ? domNode.children
                          .map(
                            (child: any) =>
                              child?.data || ""
                          )
                          .join("")
                      : ""
                  )}
                </a>
              );
            }
          }

          return undefined;
        },
      })}
    </div>
  );
}

/* =========================================================
   FAQ SECTION ITEM
========================================================= */

interface FAQSectionItemProps {
  section: {
    sectionId: number;
    sectionName: string;
    sectionSlug: string;
    faqs: FAQItem[];
  };
}

const FAQSectionItem = ({
  section,
}: FAQSectionItemProps) => {
  const [openId, setOpenId] =
    useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenId((previous) => {
      if (previous === id) {
        return null;
      }

      return id;
    });
  };

  return (
    <div className="w-full">
      {/* SECTION TITLE */}

      <div className="mb-4 pl-1">
        <h2 className="text-[14px] font-semibold uppercase tracking-[4px] text-[#b98221] md:text-[15px]">
          {section.sectionName}
        </h2>
      </div>

      {/* FAQ BOX */}

      <div className="overflow-hidden rounded-[20px] border border-[#e2e3e7] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.04)]">
        {section.faqs.map(
          (faq, index) => {
            const open =
              openId === faq.id;

            return (
              <div
                key={faq.id}
                className={
                  index !==
                  section.faqs.length - 1
                    ? "border-b border-[#eeeeee]"
                    : ""
                }
              >
                {/* QUESTION */}

                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={
                    "faq-answer-" +
                    String(faq.id)
                  }
                  onClick={() =>
                    toggleFaq(faq.id)
                  }
                  className="flex w-full items-center justify-between gap-5 px-7 py-6 text-left md:px-8 md:py-7"
                >
                  <span className="text-[16px] font-medium leading-6 text-[#181818] md:text-[17px]">
                    {faq.question}
                  </span>

                  <span
                    className={
                      "flex h-[30px] w-[30px] min-h-[30px] min-w-[30px] items-center justify-center rounded-full border border-[#dddddd] bg-white text-[20px] font-light leading-none text-[#b98221] transition-transform duration-300 " +
                      (open
                        ? "rotate-45"
                        : "rotate-0")
                    }
                  >
                    +
                  </span>
                </button>

                {/* ANSWER */}

                <div
                  className={
                    "grid transition-all duration-300 ease-in-out " +
                    (open
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0")
                  }
                >
                  <div className="overflow-hidden">
                    <div
                      id={
                        "faq-answer-" +
                        String(faq.id)
                      }
                      className="border-t border-[#eeeeee] px-7 py-6 md:px-8"
                    >
                      <SafeHtml
                        html={faq.answer}
                        className="faq-answer-html"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const FooterPolicyClient =
  () => {
    const params = useParams();

    const slug =
      typeof params?.slug ===
      "string"
        ? params.slug
        : "";

    const isFAQsPage =
      slug.toLowerCase() ===
      "faqs";

    /* =====================================================
       POLICY API
    ===================================================== */

    const {
      data: contentsData,
      isLoading: contentsLoading,
      error: contentsError,
    } = useGetContentsQuery(
      {},
      {
        skip: isFAQsPage,
      }
    );

    /* =====================================================
       FAQ API

       Your faqApi endpoint expects `void`,
       therefore use undefined as argument.
    ===================================================== */

    const {
      data: faqData,
      isLoading: faqLoading,
      error: faqError,
    } = useGetFAQsQuery(
      undefined,
      {
        skip: !isFAQsPage,
      }
    );

    const [content, setContent] =
      useState<ContentData | null>(
        null
      );

    /* =====================================================
       FAQ DATA
    ===================================================== */

    const faqResponse =
      faqData as
        | FAQResponse
        | undefined;

    const faqItems =
      faqResponse?.data || [];

    /* =====================================================
       FIND POLICY CONTENT
    ===================================================== */

    useEffect(() => {
      if (
        isFAQsPage ||
        !contentsData?.data ||
        !slug
      ) {
        return;
      }

      const found =
        contentsData.data.find(
          (item: ContentData) =>
            item.slug === slug
        );

      setContent(
        found || null
      );
    }, [
      contentsData,
      slug,
      isFAQsPage,
    ]);

    /* =====================================================
       GROUP FAQS BY SECTION
    ===================================================== */

    const groupedFaqs = useMemo(() => {
      const grouped: Record<
        string,
        {
          sectionId: number;
          sectionName: string;
          sectionSlug: string;
          faqs: FAQItem[];
        }
      > = {};

      const activeFaqs =
        faqItems
          .filter(
            (faq) =>
              faq.is_active === true
          )
          .sort((a, b) => {
            if (
              a.order !== b.order
            ) {
              return (
                a.order - b.order
              );
            }

            return a.id - b.id;
          });

      activeFaqs.forEach(
        (faq) => {
          const sectionId =
            faq.section &&
            faq.section.id
              ? faq.section.id
              : faq.section_id;

          const sectionName =
            faq.section &&
            faq.section.name
              ? faq.section.name
              : "Support";

          const sectionSlug =
            faq.section &&
            faq.section.slug
              ? faq.section.slug
              : "section-" +
                String(sectionId);

          if (
            !grouped[sectionSlug]
          ) {
            grouped[sectionSlug] = {
              sectionId:
                sectionId,
              sectionName:
                sectionName,
              sectionSlug:
                sectionSlug,
              faqs: [],
            };
          }

          grouped[
            sectionSlug
          ].faqs.push(faq);
        }
      );

      return Object.values(
        grouped
      );
    }, [faqItems]);

    /* =====================================================
       HEADING RENDER
    ===================================================== */

    const renderHeading = (
      heading: string
    ) => {
      if (!heading) {
        return null;
      }

      if (
        heading.includes("<h1") ||
        heading.includes("<h2") ||
        heading.includes("<h3") ||
        heading.includes("<h4")
      ) {
        return (
          <SafeHtml
            html={heading}
            className="policy-heading-html"
          />
        );
      }

      let headingLevel:
        | "h1"
        | "h2"
        | "h3"
        | "h4" = "h4";

      if (
        heading
          .toLowerCase()
          .startsWith("h1")
      ) {
        headingLevel = "h1";
      } else if (
        heading
          .toLowerCase()
          .startsWith("h2")
      ) {
        headingLevel = "h2";
      } else if (
        heading
          .toLowerCase()
          .startsWith("h3")
      ) {
        headingLevel = "h3";
      }

      const cleanText =
        heading
          .replace(
            /<h[1-4]>/gi,
            ""
          )
          .replace(
            /<\/h[1-4]>/gi,
            ""
          )
          .trim();

      if (
        headingLevel === "h1"
      ) {
        return (
          <h1 className="font-bold tracking-[-0.01em] text-[#1a1a2e]">
            {cleanText}
          </h1>
        );
      }

      if (
        headingLevel === "h2"
      ) {
        return (
          <h2 className="font-bold tracking-[-0.01em] text-[#1a1a2e]">
            {cleanText}
          </h2>
        );
      }

      if (
        headingLevel === "h3"
      ) {
        return (
          <h3 className="font-bold tracking-[-0.01em] text-[#1a1a2e]">
            {cleanText}
          </h3>
        );
      }

      return (
        <h4 className="font-bold tracking-[-0.01em] text-[#1a1a2e]">
          {cleanText}
        </h4>
      );
    };

    /* =====================================================
       FAQ LOADING
    ===================================================== */

    if (
      isFAQsPage &&
      faqLoading
    ) {
      return (
        <div className="min-h-screen bg-[#f5f6f8]">
          <Header />

          <main className="min-h-[700px]">
            {/* FAQ HERO */}

            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#2d2b4a] to-[#3d3a5c] px-6 py-20 text-center md:py-[60px]">
              <div className="relative z-10 mx-auto max-w-[800px]">
                <span className="mb-5 inline-block rounded-full border border-[rgba(249,199,68,0.2)] bg-[rgba(249,199,68,0.15)] px-5 py-1.5 text-[13px] font-semibold uppercase tracking-[2px] text-[#f9c744]">
                  Help Center
                </span>

                <h1 className="mb-4 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.15] tracking-[-0.02em] text-white">
                  Frequently Asked Questions
                </h1>

                <p className="text-[15px] text-white/60">
                  Find answers to common questions
                  about IndieKonnect
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f9c744] via-[#8b7bbf] via-[#c44a6a] to-[#4bbf8a] to-[#f9c744]" />
            </div>

            {/* LOADER */}

            <div className="flex min-h-[450px] flex-col items-center justify-center gap-5">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f9c744] border-t-transparent" />

              <p className="text-[15px] text-[#9a97b0]">
                Loading FAQs...
              </p>
            </div>
          </main>

          <Footer />
        </div>
      );
    }

    /* =====================================================
       FAQ ERROR
    ===================================================== */

    if (
      isFAQsPage &&
      faqError
    ) {
      return (
        <div className="min-h-screen bg-[#f5f6f8]">
          <Header />

          <main>
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#2d2b4a] to-[#3d3a5c] px-6 py-20 text-center md:py-[60px]">
              <div className="relative z-10 mx-auto max-w-[800px]">
                <span className="mb-5 inline-block rounded-full border border-[rgba(249,199,68,0.2)] bg-[rgba(249,199,68,0.15)] px-5 py-1.5 text-[13px] font-semibold uppercase tracking-[2px] text-[#f9c744]">
                  Help Center
                </span>

                <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-white">
                  Frequently Asked Questions
                </h1>
              </div>
            </div>

            <div className="flex min-h-[500px] flex-col items-center justify-center px-5 text-center">
              <div className="mb-5 text-6xl">
                ❓
              </div>

              <h2 className="mb-3 text-2xl font-bold text-[#1a1a2e]">
                FAQs Not Available
              </h2>

              <p className="max-w-[450px] text-[15px] leading-7 text-[#6b6882]">
                We could not load the FAQ sections
                right now. Please try again later.
              </p>
            </div>
          </main>

          <Footer />
        </div>
      );
    }

    /* =====================================================
       FAQ PAGE
    ===================================================== */

    if (isFAQsPage) {
      return (
        <div className="min-h-screen bg-[#f5f6f8]">
          <Header />

          <main>
            {/* FAQ HERO */}

            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#2d2b4a] to-[#3d3a5c] px-6 py-20 text-center md:py-[60px]">
              <div className="absolute -right-[20%] -top-[50%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(249,199,68,0.08)_0%,transparent_70%)]" />

              <div className="absolute -bottom-[30%] -left-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,123,191,0.06)_0%,transparent_70%)]" />

              <div className="relative z-10 mx-auto max-w-[800px]">
                <span className="mb-5 inline-block rounded-full border border-[rgba(249,199,68,0.2)] bg-[rgba(249,199,68,0.15)] px-5 py-1.5 text-[13px] font-semibold uppercase tracking-[2px] text-[#f9c744] backdrop-blur-[10px]">
                  Help Center
                </span>

                <h1 className="mb-4 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.15] tracking-[-0.02em] text-white">
                  Frequently Asked Questions
                </h1>

                <p className="text-[15px] tracking-[0.3px] text-white/60">
                  Find answers to common questions
                  about IndieKonnect
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f9c744] via-[#8b7bbf] via-[#c44a6a] to-[#4bbf8a] to-[#f9c744] bg-[length:200%_100%] animate-[gradientMove_4s_ease-in-out_infinite]" />
            </div>

            {/* FAQ CONTENT */}

            <section className="bg-[#f5f6f8] px-5 py-10 pb-20 md:px-8 md:py-14 md:pb-24">
              <div className="mx-auto max-w-[1280px]">
                {groupedFaqs.length > 0 ? (
                  <div className="space-y-9 md:space-y-10">
                    {groupedFaqs.map(
                      (section) => (
                        <FAQSectionItem
                          key={
                            section.sectionId
                          }
                          section={
                            section
                          }
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                    <div className="mb-5 text-5xl">
                      ❓
                    </div>

                    <h2 className="mb-2 text-2xl font-bold text-[#1a1a2e]">
                      No FAQ Sections Found
                    </h2>

                    <p className="text-[15px] text-[#6b6882]">
                      FAQ sections are currently
                      unavailable.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </main>

          <Footer />

          <style jsx global>{`
            @keyframes gradientMove {
              0%,
              100% {
                background-position: 0% 50%;
              }

              50% {
                background-position: 100% 50%;
              }
            }

            .faq-answer-html {
              color: #707070;
              font-size: 15px;
              line-height: 1.8;
            }

            .faq-answer-html p {
              margin: 0 0 14px;
            }

            .faq-answer-html p:last-child {
              margin-bottom: 0;
            }

            .faq-answer-html strong,
            .faq-answer-html b {
              color: #181818;
              font-weight: 700;
            }

            .faq-answer-html em,
            .faq-answer-html i {
              font-style: italic;
            }

            .faq-answer-html ul,
            .faq-answer-html ol {
              margin: 10px 0 16px;
              padding-left: 24px;
            }

            .faq-answer-html ul {
              list-style: disc;
            }

            .faq-answer-html ol {
              list-style: decimal;
            }

            .faq-answer-html li {
              margin-bottom: 7px;
              padding-left: 3px;
            }

            .faq-answer-html a,
            .safe-html-link {
              color: #2563eb;
              font-weight: 600;
              text-decoration: underline;
              text-underline-offset: 2px;
            }

            .faq-answer-html a:hover,
            .safe-html-link:hover {
              color: #1d4ed8;
            }

            .faq-answer-html table {
              width: 100%;
              min-width: 650px;
              margin: 18px 0;
              border-collapse: collapse;
              background: #ffffff;
            }

            .faq-answer-html th {
              background: #f8f8f9;
              color: #181818;
              font-weight: 700;
            }

            .faq-answer-html th,
            .faq-answer-html td {
              border: 1px solid #e5e7eb;
              padding: 10px 12px;
              text-align: left;
              vertical-align: top;
            }

            .faq-answer-html tbody tr:nth-child(even) {
              background: #fafafa;
            }

            .faq-answer-html blockquote {
              margin: 14px 0;
              padding: 10px 14px;
              border-left: 3px solid #b98221;
              background: #fafafa;
            }

            @media (max-width: 640px) {
              .faq-answer-html {
                font-size: 13px;
              }

              .faq-answer-html table {
                min-width: 560px;
                font-size: 12px;
              }

              .faq-answer-html th,
              .faq-answer-html td {
                padding: 8px 9px;
              }
            }
          `}</style>
        </div>
      );
    }

    /* =====================================================
       POLICY LOADING
    ===================================================== */

    if (contentsLoading) {
      return (
        <div>
          <Header />

          <div className="mx-auto max-w-[880px] px-6 py-10 md:px-4 md:py-6">
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-5">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f9c744] border-t-transparent" />

              <p className="text-[15px] text-[#9a97b0]">
                Loading content...
              </p>
            </div>
          </div>

          <Footer />
        </div>
      );
    }

    /* =====================================================
       POLICY NOT FOUND
    ===================================================== */

    if (
      contentsError ||
      !content
    ) {
      return (
        <div>
          <Header />

          <div className="mx-auto max-w-[880px] px-6 py-10 md:px-4 md:py-6">
            <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 text-center">
              <span className="mb-2 text-7xl">
                📄
              </span>

              <h2 className="text-3xl font-bold text-[#1a1a2e] md:text-4xl">
                Content Not Found
              </h2>

              <p className="max-w-[400px] text-lg text-[#6b6882]">
                The page you&apos;re looking for
                doesn&apos;t exist or has been moved.
              </p>
            </div>
          </div>

          <Footer />
        </div>
      );
    }

    /* =====================================================
       NORMAL POLICY PAGE
    ===================================================== */

    return (
      <div>
        <Header />

        <main className="min-h-screen bg-white text-[#1a1a2e]">
          {/* HERO */}

          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#2d2b4a] to-[#3d3a5c] px-6 py-20 text-center md:px-5 md:py-[60px]">
            <div className="absolute -right-[20%] -top-[50%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(249,199,68,0.08)_0%,transparent_70%)]" />

            <div className="absolute -bottom-[30%] -left-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,123,191,0.06)_0%,transparent_70%)]" />

            <div className="relative z-10 mx-auto max-w-[800px]">
              <span className="mb-5 inline-block rounded-full border border-[rgba(249,199,68,0.2)] bg-[rgba(249,199,68,0.15)] px-5 py-1.5 text-[13px] font-semibold uppercase tracking-[2px] text-[#f9c744] backdrop-blur-[10px]">
                Policy
              </span>

              <h1 className="mb-4 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.15] tracking-[-0.02em] text-white">
                {content.title}
              </h1>

              <p className="text-[15px] font-normal tracking-[0.3px] text-white/60">
                Last updated:{" "}
                {new Date(
                  content.updated_at
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f9c744] via-[#8b7bbf] via-[#c44a6a] to-[#4bbf8a] to-[#f9c744] bg-[length:200%_100%] animate-[gradientMove_4s_ease-in-out_infinite]" />
          </div>

          {/* POLICY CONTENT */}

          <div className="mx-auto max-w-[880px] px-6 py-10 pb-20 md:px-4 md:py-6">
            {content.blocks.map(
              (block) => (
                <div
                  key={block.id}
                  className="mb-8 rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.95)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.04)] backdrop-blur-[20px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(249,199,68,0.25)] hover:shadow-[0_24px_80px_rgba(249,199,68,0.1)] md:rounded-3xl md:p-10 lg:p-12"
                >
                  {/* HEADING */}

                  {block.heading && (
                    <div className="mb-5">
                      {renderHeading(
                        block.heading
                      )}
                    </div>
                  )}

                  {/* SHORT DESCRIPTION */}

                  {block.short_description && (
                    <SafeHtml
                      html={
                        block.short_description
                      }
                      className="policy-short-description"
                    />
                  )}

                  {/* DESCRIPTION */}

                  {block.description && (
                    <SafeHtml
                      html={
                        block.description
                      }
                      className="policy-content"
                    />
                  )}
                </div>
              )
            )}
          </div>
        </main>

        <Footer />

        <style jsx global>{`
          @keyframes gradientMove {
            0%,
            100% {
              background-position: 0% 50%;
            }

            50% {
              background-position: 100% 50%;
            }
          }

          .policy-short-description {
            margin-bottom: 24px;
            color: #6b6882;
          }

          .policy-content {
            color: #6b6882;
          }

          .policy-content h1,
          .policy-short-description h1 {
            margin-bottom: 10px;
            color: #1a1a2e;
            font-size: 2.25rem;
            font-weight: 700;
            line-height: 1.2;
          }

          .policy-content h2,
          .policy-short-description h2 {
            margin-bottom: 10px;
            color: #1a1a2e;
            font-size: 1.75rem;
            font-weight: 700;
            line-height: 1.25;
          }

          .policy-content h3,
          .policy-short-description h3 {
            margin-bottom: 9px;
            color: #1a1a2e;
            font-size: 1.35rem;
            font-weight: 700;
            line-height: 1.3;
          }

          .policy-content h4,
          .policy-short-description h4 {
            margin-bottom: 8px;
            color: #6b6882;
            font-size: 1.1rem;
            font-weight: 600;
            line-height: 1.4;
          }

          .policy-content p,
          .policy-short-description p {
            margin-bottom: 1rem;
            color: #6b6882;
            font-size: 1rem;
            line-height: 1.8;
          }

          .policy-content ul,
          .policy-short-description ul {
            margin: 1rem 0 1.25rem;
            padding-left: 1.75rem;
            list-style: disc;
          }

          .policy-content ol,
          .policy-short-description ol {
            margin: 1rem 0 1.25rem;
            padding-left: 1.75rem;
            list-style: decimal;
          }

          .policy-content li,
          .policy-short-description li {
            padding: 0.35rem 0;
            color: #6b6882;
            font-size: 1rem;
            line-height: 1.7;
          }

          .policy-content strong,
          .policy-short-description strong,
          .policy-content b,
          .policy-short-description b {
            color: #1a1a2e;
            font-weight: 600;
          }

          .policy-content a,
          .policy-short-description a {
            color: #2563eb;
            font-weight: 600;
            text-decoration: underline;
            text-underline-offset: 2px;
          }

          .policy-content a:hover,
          .policy-short-description a:hover {
            color: #1d4ed8;
          }

          .policy-content blockquote,
          .policy-short-description blockquote {
            margin: 16px 0;
            padding: 12px 16px;
            border-left: 3px solid #f9c744;
            background: #fafafa;
          }

          .policy-content hr,
          .policy-short-description hr {
            margin: 24px 0;
            border: 0;
            border-top: 1px solid rgba(0, 0, 0, 0.08);
          }

          .policy-content table,
          .policy-short-description table {
            width: 100%;
            min-width: 650px;
            margin: 18px 0;
            border-collapse: collapse;
            background: #ffffff;
          }

          .policy-content th,
          .policy-short-description th {
            background: #f8f8f9;
            color: #1a1a2e;
            font-weight: 700;
          }

          .policy-content th,
          .policy-content td,
          .policy-short-description th,
          .policy-short-description td {
            border: 1px solid #e5e7eb;
            padding: 10px 12px;
            text-align: left;
            vertical-align: top;
          }

          .policy-content tbody tr:nth-child(even),
          .policy-short-description tbody tr:nth-child(even) {
            background: #fafafa;
          }

          @media (max-width: 768px) {
            .policy-content h1,
            .policy-short-description h1 {
              font-size: 1.75rem;
            }

            .policy-content h2,
            .policy-short-description h2 {
              font-size: 1.4rem;
            }

            .policy-content h3,
            .policy-short-description h3 {
              font-size: 1.15rem;
            }

            .policy-content p,
            .policy-content li,
            .policy-short-description p,
            .policy-short-description li {
              font-size: 0.95rem;
            }

            .policy-content table,
            .policy-short-description table {
              min-width: 560px;
              font-size: 12px;
            }
          }
        `}</style>
      </div>
    );
  };

export default FooterPolicyClient;

