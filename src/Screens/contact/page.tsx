"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import Header from "../../components/common/Header";
import Footer from "../../components/Footer/Footer";
import ContactForm from "../../components/contact/ContactForm";

import { useGetFAQsQuery } from "@/lib/redux/api/faqApi";
import {
  useGetContentsQuery,
  useGetFooterQuery,
} from "@/lib/redux/api/Home/contentApi";

/* =========================================================
   CONTACT HELPERS – FILTER CONTENT USING SLUG
========================================================= */

type ContactBlock = {
  heading: string;
  short_description: string | null;
  description: string | null;
};

const CONTACT_US_SLUG = "contact-us";

function getContactUsContent(contents: any) {
  /*
    API response can be in different formats:

    1. { data: [ { slug: "contact-us", blocks: [] } ] }

    2. { data: { slug: "contact-us", blocks: [] } }

    3. { slug: "contact-us", blocks: [] }

    4. [ { slug: "contact-us", blocks: [] } ]

    5. { data: { data: [ { slug: "contact-us", blocks: [] } ] } }
  */

  const contentCandidates = [
    contents?.data?.data,
    contents?.data,
    contents?.contents?.data,
    contents?.contents,
    contents,
  ];

  for (const candidate of contentCandidates) {
    const contentList = Array.isArray(candidate)
      ? candidate
      : candidate && typeof candidate === "object"
        ? [candidate]
        : [];

    const matchedContent = contentList.find(
      (item: any) =>
        String(item?.slug || "")
          .trim()
          .toLowerCase() === CONTACT_US_SLUG,
    );

    if (matchedContent) {
      return matchedContent;
    }
  }

  return undefined;
}

function getBlockByHeading(
  contactContent: any,
  heading: string,
): ContactBlock | undefined {
  if (!contactContent || !Array.isArray(contactContent.blocks)) {
    return undefined;
  }

  return contactContent.blocks.find(
    (block: any) =>
      String(block?.heading || "")
        .trim()
        .toLowerCase() === heading.toLowerCase().trim(),
  );
}

/* =========================================================
   FAQ TYPES
========================================================= */

type FAQItem = {
  id: number;
  section_id: number;
  question: string;
  answer: string;
  order: number;
  is_active: boolean | number;
  section?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

type FAQGroup = {
  id: string;
  name: string;
  items: FAQItem[];
};

const visible = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

/* =========================================================
   FAQ HTML SANITIZER
========================================================= */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",
  "blockquote",
  "pre",
  "code",
  "div",
  "span",
  "hr",
]);

const FORBIDDEN_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "svg",
  "math",
  "link",
  "meta",
  "base",
  "img",
  "video",
  "audio",
  "template",
]);

const EMPTY_REMOVABLE_TAGS = new Set([
  "p",
  "div",
  "span",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
  "code",
  "li",
  "a",
]);

function isEmptyText(value: string): boolean {
  return (
    value.replace(
      /[\s\u00a0\u200b\u200c\u200d\uFEFF]/g,
      "",
    ).length === 0
  );
}

function hasMeaningfulContent(element: Element): boolean {
  return Array.from(element.childNodes).some((node) => {
    if (node.nodeType === 3) {
      return !isEmptyText(node.textContent || "");
    }

    if (node.nodeType !== 1) {
      return false;
    }

    const child = node as Element;
    const tag = child.tagName.toLowerCase();

    if (tag === "br") {
      return false;
    }

    if (["table", "hr", "ul", "ol"].includes(tag)) {
      return true;
    }

    return hasMeaningfulContent(child);
  });
}

function collapseRepeatedBreaks(parent: ParentNode): void {
  let previousWasBreak = false;

  Array.from(parent.childNodes).forEach((node) => {
    if (node.nodeType === 1) {
      const element = node as Element;
      const tag = element.tagName.toLowerCase();

      if (tag === "br") {
        if (previousWasBreak) {
          element.remove();
        } else {
          previousWasBreak = true;
        }

        return;
      }

      collapseRepeatedBreaks(element);
      previousWasBreak = false;
      return;
    }

    if (node.nodeType === 3) {
      const value = node.textContent || "";

      if (isEmptyText(value) && previousWasBreak) {
        node.parentNode?.removeChild(node);
        return;
      }

      if (!isEmptyText(value)) {
        previousWasBreak = false;
      }
    }
  });
}

function sanitizeFaqHtml(raw: string): string {
  if (
    typeof document === "undefined" ||
    typeof DOMParser === "undefined"
  ) {
    return "";
  }

  let html = raw || "";

  const decoder = document.createElement("textarea");

  for (let i = 0; i < 3; i += 1) {
    decoder.innerHTML = html;
    const decoded = decoder.value;

    if (decoded === html) break;

    html = decoded;
  }

  const parsed = new DOMParser().parseFromString(
    html,
    "text/html",
  );

  function clean(node: Node): void {
    if (node.nodeType === 8) {
      node.parentNode?.removeChild(node);
      return;
    }

    if (node.nodeType !== 1) {
      return;
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (FORBIDDEN_TAGS.has(tag)) {
      element.remove();
      return;
    }

    Array.from(element.childNodes).forEach(clean);

    if (!ALLOWED_TAGS.has(tag)) {
      element.replaceWith(
        ...Array.from(element.childNodes),
      );
      return;
    }

    const href =
      tag === "a"
        ? element.getAttribute("href")?.trim()
        : null;

    Array.from(element.attributes).forEach((attribute) => {
      element.removeAttribute(attribute.name);
    });

    if (
      tag === "a" &&
      href &&
      /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href)
    ) {
      element.setAttribute("href", href);
      element.setAttribute("target", "_blank");
      element.setAttribute(
        "rel",
        "noopener noreferrer nofollow",
      );
    }

    if (
      EMPTY_REMOVABLE_TAGS.has(tag) &&
      !hasMeaningfulContent(element)
    ) {
      element.remove();
      return;
    }
  }

  Array.from(parsed.body.childNodes).forEach(clean);

  collapseRepeatedBreaks(parsed.body);

  return parsed.body.innerHTML.trim();
}

/* =========================================================
   FAQ ANSWER
========================================================= */

function FaqAnswer({ html }: { html: string }) {
  const safeHtml = useMemo(
    () => sanitizeFaqHtml(html),
    [html],
  );

  return (
    <div
      className="contact-faq-content min-w-0 w-full max-w-full text-[14px] leading-7 text-[#626973]"
      dangerouslySetInnerHTML={{
        __html: safeHtml,
      }}
    />
  );
}

/* =========================================================
   CONTACT TILE
========================================================= */

function ContactTile({
  icon: Icon,
  eyebrow,
  title,
  detail,
  href,
}: {
  icon: typeof Mail;
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
}) {
  return (
    <motion.a
      variants={visible}
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={
        href.startsWith("http")
          ? "noopener noreferrer"
          : undefined
      }
      className="group flex h-full min-w-0 flex-col rounded-[22px] border border-[#E9EBED] bg-white p-5 shadow-[0_6px_24px_rgba(0,0,0,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-[#CFD4D7] hover:shadow-[0_16px_40px_rgba(0,0,0,0.075)] sm:p-6"
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5F5] text-[#15191D] transition-colors group-hover:bg-[#111820] group-hover:text-white">
          <Icon size={21} strokeWidth={1.7} />
        </span>

        <ArrowRight
          size={18}
          className="mt-1 shrink-0 text-[#9DA4AA] transition-all group-hover:translate-x-1 group-hover:text-[#111820]"
        />
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#7B838B]">
        {eyebrow}
      </p>

      <h3 className="mt-1.5 text-[19px] font-semibold tracking-[-0.025em] text-[#15191D]">
        {title}
      </h3>

      <p className="mt-2 min-w-0 break-words text-[14px] leading-6 text-[#636B73] [overflow-wrap:anywhere]">
        {detail}
      </p>
    </motion.a>
  );
}

/* =========================================================
   CONTACT PAGE
========================================================= */

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // FAQ API
  const {
    data: faqResponse,
    isLoading: faqLoading,
    isError: faqError,
  } = useGetFAQsQuery({});

  // Footer API
  const { data: footerResponse } = useGetFooterQuery({});

  // Contents API
  const { data: contactResponse } = useGetContentsQuery({});

  /* =====================================================
     FILTER CONTACT-US CONTENT BY SLUG
  ===================================================== */

  const contactContent = useMemo(() => {
    return getContactUsContent(contactResponse);
  }, [contactResponse]);

  /* =====================================================
     CONTACT DETAILS FROM FILTERED CONTENT
  ===================================================== */

  const contactDetails = useMemo(() => {
    const emailBlock = getBlockByHeading(
      contactContent,
      "Email us",
    );

    const callBlock = getBlockByHeading(
      contactContent,
      "Call us",
    );

    const visitBlock = getBlockByHeading(
      contactContent,
      "Visit us",
    );

    const getInTouchBlock = getBlockByHeading(
      contactContent,
      "Get in touch",
    );

    const email =
      emailBlock?.short_description?.trim() || "";

    const phoneDisplay =
      callBlock?.short_description?.trim() || "";

    const address =
      visitBlock?.short_description?.trim() || "";

    const hours =
      callBlock?.description?.trim() || "";

    const getInTouchDescription =
      getInTouchBlock?.description?.trim() || "";

    return {
      email,
      phoneDisplay,
      phoneHref: phoneDisplay.replace(/\s/g, ""),
      hours,
      address,
      getInTouchDescription,
    };
  }, [contactContent]);

  /* =====================================================
     MAP URLS FROM API ADDRESS
  ===================================================== */

  const mapsApiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY;

  const mapEmbedUrl = mapsApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
        mapsApiKey,
      )}&q=${encodeURIComponent(contactDetails.address)}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(
        contactDetails.address,
      )}&z=15&output=embed`;

  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    contactDetails.address,
  )}`;

  const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    contactDetails.address,
  )}`;

  /* =====================================================
     GROUP FAQS
  ===================================================== */

  const groupedFaqs = useMemo<FAQGroup[]>(() => {
    const rawFaqs: FAQItem[] = Array.isArray(
      faqResponse?.data,
    )
      ? faqResponse.data
      : [];

    const groups = new Map<string, FAQGroup>();

    [...rawFaqs]
      .filter((faq) => Boolean(faq.is_active))
      .sort(
        (a, b) =>
          (Number(a.order) || 0) -
          (Number(b.order) || 0),
      )
      .forEach((faq) => {
        const id = String(
          faq.section?.id ??
            faq.section_id ??
            "general",
        );

        if (!groups.has(id)) {
          groups.set(id, {
            id,
            name:
              faq.section?.name ||
              "General questions",
            items: [],
          });
        }

        groups.get(id)?.items.push(faq);
      });

    return Array.from(groups.values());
  }, [faqResponse]);

  /* =====================================================
     SOCIAL LINKS
  ===================================================== */

  const socialLinks = useMemo(() => {
    const footer =
      footerResponse?.data?.footer ??
      footerResponse?.footer ??
      null;

    const options = [
      {
        label: "Instagram",
        icon: FaInstagram,
        url: footer?.instagram,
      },
      {
        label: "Facebook",
        icon: FaFacebookF,
        url: footer?.facebook,
      },
      {
        label: "X",
        icon: FaXTwitter,
        url: footer?.twitter,
      },
      {
        label: "YouTube",
        icon: FaYoutube,
        url: footer?.youtube,
      },
      {
        label: "LinkedIn",
        icon: FaLinkedinIn,
        url: footer?.linkedin,
      },
      {
        label: "Pinterest",
        icon: FaPinterestP,
        url: footer?.pinterest,
      },
    ];

    return options.filter(
      (
        item,
      ): item is (typeof options)[number] & {
        url: string;
      } =>
        typeof item.url === "string" &&
        /^https?:\/\//i.test(item.url.trim()),
    );
  }, [footerResponse]);

  return (
    <div className="contact-page min-h-screen w-full max-w-full overflow-x-clip bg-white text-[#15191D]">
      <Header
        cartItems={[]}
        cartCount={0}
        cartSubtotal={0}
        wishlistCount={0}
      />

      <main className="relative bg-white">
        <div className="mx-auto w-full max-w-[1220px] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
          {/* HERO */}
          <motion.section
            initial="hidden"
            animate="show"
            variants={visible}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-[760px] pb-6 pt-5 text-center sm:pb-6 sm:pt-7"
          >
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#168998]">
              <span className="size-1.5 rounded-full bg-[#16A9BA]" />
              LET'S CONNECT
            </span>

            <h1 className="mt-5 break-words font-serif text-5xl leading-[1.12] tracking-[-0.045em] text-[#111820]">
              Let’s make things{" "}
              <span className="font-normal italic">
                simple.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-[590px] text-[10px] leading-6 text-[#69717A] sm:text-[16px]">
              {contactDetails.getInTouchDescription}
            </p>
          </motion.section>

          {/* CONTACT DETAILS */}
          <motion.section
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.07 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
            aria-label="Contact details"
          >
            <ContactTile
              icon={Mail}
              eyebrow="WRITE TO US"
              title="Email support"
              detail={contactDetails.email}
              href={`mailto:${contactDetails.email}`}
            />

            <ContactTile
              icon={Phone}
              eyebrow="SPEAK WITH US"
              title="Give us a call"
              detail={contactDetails.phoneDisplay}
              href={`tel:${contactDetails.phoneHref}`}
            />

            <ContactTile
              icon={MapPin}
              eyebrow="COME SAY HELLO"
              title="Our office"
              detail={contactDetails.address}
              href={mapSearchUrl}
            />
          </motion.section>

          {/* CONTACT FORM + MAP */}
          <section className="mt-6 grid min-w-0 grid-cols-1 items-stretch gap-5 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6">
            {/* CONTACT FORM */}
            <div className="contact-form-panel min-w-0 rounded-[28px] border border-[#E7E9EB] bg-white p-6 shadow-[0_18px_55px_rgba(0,0,0,0.045)] sm:p-9 lg:p-10">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#168998]">
                SEND A MESSAGE
              </span>

              <h2 className="mt-3 font-serif text-[clamp(1.75rem,3vw,2.35rem)] leading-tight tracking-[-0.03em]">
                Tell us what’s on your mind.
              </h2>

              <p className="mb-7 mt-3 max-w-[490px] text-[14px] leading-7 text-[#737B83]">
                Share a few details and we’ll help you find
                the right next step.
              </p>

              <ContactForm />
            </div>

            {/* MAP AND BUSINESS HOURS */}
            <div className="flex min-w-0 flex-col gap-5">
              <div className="min-w-0 overflow-hidden rounded-[24px] border border-[#E9EBED] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.035)]">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#168998]">
                      FIND US
                    </p>

                    <h2 className="mt-1 text-[19px] font-semibold tracking-[-0.025em]">
                      Visit our office
                    </h2>
                  </div>

                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F3F6F6]">
                    <MapPin size={18} />
                  </span>
                </div>

                <div className="relative h-[290px] w-full bg-[#F2F5F5] sm:h-[340px] lg:h-[365px]">
                  {contactDetails.address && (
                    <iframe
                      title="Google Maps location for Indiekonnect office"
                      src={mapEmbedUrl}
                      className="absolute inset-0 h-full w-full border-0"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  )}
                </div>

                <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                  <p className="min-w-0 break-words text-[13px] leading-6 text-[#626B74] [overflow-wrap:anywhere]">
                    <MapPin
                      size={15}
                      className="mr-1 inline-block -translate-y-px text-[#15191D]"
                    />
                    {contactDetails.address}
                  </p>

                  <a
                    href={mapDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex min-h-12 w-full flex-wrap items-center justify-center gap-2 rounded-xl bg-[#111820] px-5 py-3 text-center text-[13px] font-semibold text-white transition-all hover:bg-[#27313A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    <Navigation size={17} />
                    Get directions
                    <ExternalLink size={15} />
                  </a>

                  <a
                    href={mapSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex min-h-9 items-center justify-center gap-1.5 text-[12px] font-medium text-[#57616A] underline-offset-4 hover:text-black hover:underline"
                  >
                    Open full map
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>

              {/* BUSINESS HOURS */}
              <div className="min-w-0 rounded-[24px] border border-[#E9EBED] bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.025)] sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#F2F5F5]">
                    <Clock3 size={20} />
                  </span>

                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold">
                      Business hours
                    </h3>

                    <p className="mt-1 break-words text-[13px] leading-6 text-[#6D757D]">
                      {contactDetails.hours}
                    </p>
                  </div>
                </div>

                {socialLinks.length > 0 && (
                  <div className="mt-5 border-t border-[#ECEEF0] pt-5">
                    <p className="mb-3 text-[12px] font-semibold text-[#303740]">
                      Follow our journey
                    </p>

                    <div className="flex flex-wrap gap-2.5">
                      {socialLinks.map((social) => {
                        const Icon = social.icon;

                        return (
                          <a
                            key={social.label}
                            href={social.url.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.label}
                            title={social.label}
                            className="flex size-10 items-center justify-center rounded-xl border border-[#E3E7EA] bg-white text-[#242B32] transition-all hover:border-[#111820] hover:bg-[#111820] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                          >
                            <Icon size={16} />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* FAQ SECTION */}
          <section
            className="mx-auto max-w-[900px] pb-1 pt-20 sm:pt-24"
            aria-labelledby="faq-heading"
          >
            <div className="mb-9 text-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#168998]">
                HELP CENTER
              </span>

              <h2
                id="faq-heading"
                className="mt-3 break-words font-serif text-[clamp(2rem,4vw,3rem)] leading-tight tracking-[-0.035em]"
              >
                Frequently asked questions
              </h2>

              <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-7 text-[#727A82]">
                A few quick answers to some of our most
                common questions.
              </p>
            </div>

            {faqLoading ? (
              <div
                className="rounded-2xl border border-[#E9EBED] px-6 py-10 text-center text-sm text-[#6E7881]"
                role="status"
              >
                Loading questions…
              </div>
            ) : faqError ? (
              <div
                className="rounded-2xl border border-[#E9EBED] px-6 py-10 text-center text-sm text-[#6E7881]"
                role="status"
              >
                FAQs are temporarily unavailable. Please
                contact our support team.
              </div>
            ) : groupedFaqs.length === 0 ? (
              <div className="rounded-2xl border border-[#E9EBED] px-6 py-10 text-center text-sm text-[#6E7881]">
                No FAQs are available right now.
              </div>
            ) : (
              <div className="space-y-7">
                {groupedFaqs.map((group) => (
                  <div key={group.id} className="min-w-0">
                    <h3 className="mb-3 px-1 text-[12px] font-bold uppercase tracking-[0.13em] text-[#5E6972]">
                      {group.name}
                    </h3>

                    <div className="min-w-0 overflow-hidden rounded-[22px] border border-[#E8EBED] bg-white">
                      {group.items.map((faq, index) => {
                        const expanded = openFaq === faq.id;

                        return (
                          <div
                            key={faq.id}
                            className={
                              index
                                ? "border-t border-[#ECEEEF]"
                                : ""
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenFaq((old) =>
                                  old === faq.id ? null : faq.id,
                                )
                              }
                              aria-expanded={expanded}
                              aria-controls={`faq-answer-${faq.id}`}
                              className="flex min-h-[68px] w-full min-w-0 items-center justify-between gap-4 px-5 py-4 text-left text-[14px] font-semibold leading-6 text-[#252B31] transition-colors hover:bg-[#FAFBFB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black sm:px-7 sm:text-[15px]"
                            >
                              <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                                {faq.question}
                              </span>

                              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#E5E8EB] bg-[#FAFBFB]">
                                <ChevronDown
                                  size={17}
                                  className={`transition-transform duration-200 ${
                                    expanded ? "rotate-180" : ""
                                  }`}
                                />
                              </span>
                            </button>

                            <AnimatePresence initial={false}>
                              {expanded && (
                                <motion.div
                                  id={`faq-answer-${faq.id}`}
                                  initial={{
                                    height: 0,
                                    opacity: 0,
                                  }}
                                  animate={{
                                    height: "auto",
                                    opacity: 1,
                                  }}
                                  exit={{
                                    height: 0,
                                    opacity: 0,
                                  }}
                                  transition={{ duration: 0.2 }}
                                  className="min-w-0 overflow-hidden"
                                >
                                  <div className="min-w-0 px-5 pb-6 sm:px-7">
                                    <FaqAnswer html={faq.answer} />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .contact-page,
        .contact-page * {
          box-sizing: border-box;
        }

        .contact-page {
          font-family: "Lato", Arial, sans-serif;
        }

        /* CONTACT FORM */
        .contact-page .contact-form-panel form {
          width: 100%;
          min-width: 0;
        }

        .contact-page
          .contact-form-panel
          form
          :is(
            input:not([type="checkbox"]):not([type="radio"]),
            textarea,
            select
          ) {
          max-width: 100%;
          min-width: 0;
          width: 100%;
          min-height: 48px;
          border: 1px solid #dfe4e7;
          border-radius: 12px;
          background: #fff;
          color: #161b20;
          font-size: 14px;
          padding: 12px 14px;
          box-shadow: none;
          outline: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .contact-page
          .contact-form-panel
          form
          svg:not(button svg) {
          display: none !important;
        }

        .contact-page
          .contact-form-panel
          form
          :is(
            input:not([type="checkbox"]):not([type="radio"]),
            textarea,
            select
          ) {
          padding-left: 16px !important;
          padding-right: 16px !important;
          text-indent: 0 !important;
          line-height: 1.5 !important;
          height: auto;
        }

        .contact-page
          .contact-form-panel
          form
          :is(input, textarea)::placeholder {
          color: #929ba5 !important;
          opacity: 1;
          font-size: 13px;
          text-indent: 0;
        }

        .contact-page
          .contact-form-panel
          form
          :is(input, textarea):focus::placeholder {
          color: #adb5bd !important;
        }

        .contact-page
          .contact-form-panel
          form
          :is(input, textarea, select) {
          box-sizing: border-box;
        }

        .contact-page
          .contact-form-panel
          form
          textarea {
          min-height: 150px;
          resize: vertical;
        }

        .contact-page
          .contact-form-panel
          form
          :is(input, textarea, select):focus {
          border-color: #111820;
          box-shadow: 0 0 0 3px rgba(17, 24, 32, 0.09);
        }

        .contact-page
          .contact-form-panel
          form
          label {
          color: #323940;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .contact-page
          .contact-form-panel
          form
          button[type="submit"] {
          min-height: 49px;
          max-width: 100%;
          border: 1px solid #111820 !important;
          border-radius: 12px !important;
          background: #111820 !important;
          color: #ffffff !important;
          padding: 12px 20px !important;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.5;
          white-space: normal;
          overflow-wrap: anywhere;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .contact-page
          .contact-form-panel
          form
          button[type="submit"]:hover:not(:disabled) {
          background: #29333c !important;
          transform: translateY(-1px);
        }

        .contact-page
          .contact-form-panel
          form
          button[type="submit"]:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .contact-page
          .contact-form-panel
          form
          :is(p, span, div, label) {
          max-width: 100%;
        }

        /* FAQ ANSWER */
        .contact-page .contact-faq-content {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          height: auto;
          min-height: 0;
          overflow-wrap: anywhere;
          word-break: normal;
          white-space: normal;
          line-height: 1.7;
        }

        .contact-page .contact-faq-content p {
          margin: 0 0 10px;
          padding: 0;
          min-height: 0;
          height: auto;
        }

        .contact-page
          .contact-faq-content
          p:last-child {
          margin-bottom: 0;
        }

        .contact-page
          .contact-faq-content
          :is(p, div, span, h1, h2, h3, h4, h5, h6):empty {
          display: none !important;
          margin: 0 !important;
          padding: 0 !important;
          height: 0 !important;
          min-height: 0 !important;
        }

        .contact-page
          .contact-faq-content
          :is(h1, h2, h3, h4, h5, h6) {
          color: #20262c;
          font-weight: 700;
          margin: 12px 0 6px;
          padding: 0;
          line-height: 1.4;
        }

        .contact-page .contact-faq-content :is(ul, ol) {
          margin: 8px 0 12px;
          padding-left: 23px;
        }

        .contact-page .contact-faq-content ul {
          list-style: disc;
        }

        .contact-page .contact-faq-content ol {
          list-style: decimal;
        }

        .contact-page .contact-faq-content li {
          margin: 3px 0;
          padding: 0;
        }

        .contact-page .contact-faq-content a {
          color: #087b8c;
          text-decoration: underline;
          overflow-wrap: anywhere;
        }

        .contact-page .contact-faq-content strong {
          font-weight: 700;
          color: #252b31;
        }

        /* FAQ TABLE */
        .contact-page .contact-faq-content table {
          width: 100%;
          max-width: 100%;
          border-collapse: collapse;
          border-spacing: 0;
          margin: 10px 0 12px;
          font-size: 13px;
          table-layout: auto;
        }

        .contact-page .contact-faq-content th {
          background: #f7f9fa;
          font-weight: 700;
        }

        .contact-page
          .contact-faq-content
          :is(th, td) {
          border: 1px solid #e6e9eb;
          padding: 9px 12px;
          text-align: left;
          vertical-align: top;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: normal;
          min-width: 75px;
        }

        .contact-page
          .contact-faq-content
          :is(table, pre) {
          display: block;
          max-width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          margin: 10px 0 12px;
          -webkit-overflow-scrolling: touch;
        }

        .contact-page
          .contact-faq-content
          table {
          width: max-content;
          min-width: 100%;
        }

        .contact-page .contact-faq-content pre {
          white-space: pre-wrap;
          word-break: break-word;
        }

        .contact-page
          .contact-faq-content
          blockquote {
          border-left: 3px solid #0f95a5;
          padding-left: 14px;
          margin: 12px 0;
        }

        .contact-page
          .contact-faq-content
          br + br {
          display: none !important;
        }

        .contact-page
          .contact-faq-content
          > :first-child {
          margin-top: 0 !important;
        }

        .contact-page
          .contact-faq-content
          > :last-child {
          margin-bottom: 0 !important;
        }

        @media (max-width: 640px) {
          .contact-page .contact-faq-content {
            font-size: 13px;
            line-height: 1.7;
          }

          .contact-page
            .contact-faq-content
            table {
            font-size: 11px;
          }

          .contact-page
            .contact-faq-content
            :is(th, td) {
            padding: 7px 8px;
            min-width: 70px;
          }

          .contact-page
            .contact-faq-content
            :is(ul, ol) {
            padding-left: 20px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-page * {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}