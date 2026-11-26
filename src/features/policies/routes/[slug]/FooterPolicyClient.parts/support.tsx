"use client";

import { useEffect, useState } from "react";
import parse from "html-react-parser";


/* =========================================================
   CONTENT TYPES
========================================================= */

export interface ContentBlock {
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


export interface ContentData {
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

export interface FAQSection {
  id: number;
  name: string;
  slug: string;
}


export interface FAQItem {
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


export interface FAQMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}


export interface FAQResponse {
  success: boolean;
  data: FAQItem[];
  meta: FAQMeta;
}


/* =========================================================
   HTML HELPERS
========================================================= */

export function decodeHtmlEntities(value: string): string {
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

export function normalizeHtml(value: string): string {
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

export interface SafeHtmlProps {
  html: string;
  className?: string;
}


export function SafeHtml({
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

export interface FAQSectionItemProps {
  section: {
    sectionId: number;
    sectionName: string;
    sectionSlug: string;
    faqs: FAQItem[];
  };
}


export const FAQSectionItem = ({
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
