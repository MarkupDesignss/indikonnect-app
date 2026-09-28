'use client'

import Header from '@/components/common/Header'
import Footer from '@/components/Footer/Footer'
import { useGetFAQsQuery } from '@/lib/redux/api/faqApi'
import { useGetContentsQuery } from '@/lib/redux/api/Home/contentApi'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface ContentBlock {
  id: number
  heading: string
  short_description: string | null
  description: string
  sort_order: number
  images: Array<{
    id: number
    url: string
    alt_text: string | null
    is_primary: boolean
  }>
  videos: any[]
}

interface ContentData {
  id: number
  title: string
  slug: string
  status: string
  created_at: string
  updated_at: string
  blocks: ContentBlock[]
}

interface FAQSection {
  id: number
  name: string
  slug: string
  description: string
  order: number
  is_active: boolean
  created_at: string
  updated_at: string

  // Optional fields in case FAQ API provides them later
  question?: string
  answer?: string
}

interface FAQResponse {
  success: boolean
  data: FAQSection[]
  meta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

/* =========================================================
   FAQ ACCORDION ITEM
========================================================= */

interface FAQSectionItemProps {
  section: FAQSection
  index: number
}

const FAQSectionItem = ({
  section,
  index,
}: FAQSectionItemProps) => {
  const [open, setOpen] = useState(false)

  const question =
    section.question ||
    section.description ||
    section.name

  const answer = section.answer || ''

  return (
    <div className="w-full">
      {/* SECTION TITLE */}
      <div className="mb-4 pl-1">
        <h2 className="text-[14px] font-semibold uppercase tracking-[4px] text-[#b98221] md:text-[15px]">
          {section.name || `Section ${index + 1}`}
        </h2>
      </div>

      {/* FAQ BOX */}
      <div className="overflow-hidden rounded-[20px] border border-[#e2e3e7] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-5 px-7 py-6 text-left md:px-8 md:py-7"
        >
          {/* QUESTION */}
          <span className="text-[16px] font-medium leading-6 text-[#181818] md:text-[17px]">
            {question}
          </span>

          {/* PLUS BUTTON */}
          <span
            className={`flex h-[30px] w-[30px] min-h-[30px] min-w-[30px] items-center justify-center rounded-full border border-[#dddddd] bg-white text-[20px] font-light leading-none text-[#b98221] transition-transform duration-300 ${
              open ? 'rotate-45' : 'rotate-0'
            }`}
          >
            +
          </span>
        </button>

        {/* ANSWER */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            open && answer
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-[#eeeeee] px-7 py-6 md:px-8">
              <div className="text-[15px] leading-7 text-[#707070]">
                {answer}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

const FooterPolicyClient = () => {
  const params = useParams()
  const slug = params?.slug as string

  const isFAQsPage = slug?.toLowerCase() === 'faqs'

  /* =========================================================
     POLICY API
  ========================================================= */

  const {
    data: contentsData,
    isLoading: contentsLoading,
    error: contentsError,
  } = useGetContentsQuery(
    {},
    {
      skip: isFAQsPage,
    }
  )

  /* =========================================================
     FAQ API
  ========================================================= */

  const {
    data: faqData,
    isLoading: faqLoading,
    error: faqError,
  } = useGetFAQsQuery(
    {},
    {
      skip: !isFAQsPage,
    }
  )

  const [content, setContent] =
    useState<ContentData | null>(null)

  const faqResponse =
    faqData as FAQResponse | undefined

  const faqSections =
    faqResponse?.data || []

  /* =========================================================
     FIND POLICY CONTENT
  ========================================================= */

  useEffect(() => {
    if (
      !isFAQsPage &&
      contentsData?.data &&
      slug
    ) {
      const found = contentsData.data.find(
        (item: ContentData) =>
          item.slug === slug
      )

      setContent(found || null)
    }
  }, [
    contentsData,
    slug,
    isFAQsPage,
  ])

  /* =========================================================
     HTML HELPER
  ========================================================= */

  const createMarkup = (html: string) => {
    return {
      __html: html,
    }
  }

  /* =========================================================
     HEADING RENDER
  ========================================================= */

  const renderHeading = (heading: string) => {
    if (!heading) return null

    if (
      heading.includes('<h1') ||
      heading.includes('<h2') ||
      heading.includes('<h3') ||
      heading.includes('<h4')
    ) {
      return (
        <div
          dangerouslySetInnerHTML={createMarkup(
            heading
          )}
        />
      )
    }

    const headingLevel =
      heading.startsWith('h1')
        ? 'h1'
        : heading.startsWith('h2')
          ? 'h2'
          : heading.startsWith('h3')
            ? 'h3'
            : 'h4'

    const HeadingTag =
      headingLevel as keyof JSX.IntrinsicElements

    const cleanText = heading
      .replace(/<h[1-4]>/g, '')
      .replace(/<\/h[1-4]>/g, '')
      .trim()

    return (
      <HeadingTag className="font-bold tracking-[-0.01em] text-[#1a1a2e]">
        {cleanText}
      </HeadingTag>
    )
  }

  /* =========================================================
     SORT FAQ SECTIONS
  ========================================================= */

  const sortedSections = [...faqSections]
    .filter(
      (section) => section.is_active
    )
    .sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order
      }

      return a.id - b.id
    })

  /* =========================================================
     FAQ LOADING
  ========================================================= */

  if (isFAQsPage && faqLoading) {
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
    )
  }

  /* =========================================================
     FAQ ERROR
  ========================================================= */

  if (isFAQsPage && faqError) {
    return (
      <div className="min-h-screen bg-[#f5f6f8]">
        <Header />

        <main>
          {/* HERO */}
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
    )
  }

  /* =========================================================
     FAQ PAGE
  ========================================================= */

  if (isFAQsPage) {
    return (
      <div className="min-h-screen bg-[#f5f6f8]">
        <Header />

        <main>
          {/* =================================================
              FAQ HERO
          ================================================= */}

          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#2d2b4a] to-[#3d3a5c] px-6 py-20 text-center md:py-[60px]">
            {/* Background Glow */}
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

            {/* Bottom Gradient Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f9c744] via-[#8b7bbf] via-[#c44a6a] to-[#4bbf8a] to-[#f9c744] bg-[length:200%_100%] animate-[gradientMove_4s_ease-in-out_infinite]" />
          </div>

          {/* =================================================
              FAQ CONTENT
          ================================================= */}

          <section className="bg-[#f5f6f8] px-5 py-10 pb-20 md:px-8 md:py-14 md:pb-24">
            <div className="mx-auto max-w-[1280px]">
              {sortedSections.length > 0 ? (
                <div className="space-y-9 md:space-y-10">
                  {sortedSections.map(
                    (section, index) => (
                      <FAQSectionItem
                        key={section.id}
                        section={section}
                        index={index}
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

        {/* FAQ GLOBAL ANIMATION */}
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
        `}</style>
      </div>
    )
  }

  /* =========================================================
     POLICY LOADING
  ========================================================= */

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
    )
  }

  /* =========================================================
     POLICY NOT FOUND
  ========================================================= */

  if (contentsError || !content) {
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
              The page you're looking for doesn't
              exist or has been moved.
            </p>
          </div>
        </div>

        <Footer />
      </div>
    )
  }

  /* =========================================================
     NORMAL POLICY PAGE
  ========================================================= */

  return (
    <div>
      <Header />

      <main className="min-h-screen bg-white text-[#1a1a2e]">
        {/* HERO SECTION */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#2d2b4a] to-[#3d3a5c] px-6 py-20 text-center md:py-[60px] md:px-5">
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
              Last updated:{' '}
              {new Date(
                content.updated_at
              ).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f9c744] via-[#8b7bbf] via-[#c44a6a] to-[#4bbf8a] to-[#f9c744] bg-[length:200%_100%] animate-[gradientMove_4s_ease-in-out_infinite]" />
        </div>

        {/* POLICY CONTENT */}
        <div className="mx-auto max-w-[880px] px-6 py-10 pb-20 md:px-4 md:py-6">
          {content.blocks.map((block) => (
            <div
              key={block.id}
              className="mb-8 rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.95)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.04)] backdrop-blur-[20px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(249,199,68,0.25)] hover:shadow-[0_24px_80px_rgba(249,199,68,0.1)] md:rounded-3xl md:p-10 lg:p-12"
            >
              {block.heading && (
                <div className="mb-5">
                  {renderHeading(
                    block.heading
                  )}
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

        .policy-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.2;
          margin-bottom: 0.5rem;
          letter-spacing: -0.01em;
        }

        .policy-content h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.25;
          margin-bottom: 0.5rem;
          letter-spacing: -0.01em;
        }

        .policy-content h3 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.3;
          margin-bottom: 0.5rem;
          letter-spacing: -0.01em;
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
          list-style: none;
          padding: 0;
          margin: 1rem 0 1.25rem;
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
          content: '✦';
          position: absolute;
          left: 0;
          top: 0.5rem;
          color: #f9c744;
          font-size: 14px;
        }

        .policy-content strong {
          color: #1a1a2e;
          font-weight: 600;
        }

        .policy-content a {
          color: #8b7bbf;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
          border-bottom: 1px solid transparent;
        }

        .policy-content a:hover {
          color: #e8a82c;
          border-bottom-color: #f9c744;
        }

        .policy-content hr {
          border: none;
          border-top: 2px solid rgba(0, 0, 0, 0.06);
          margin: 1.5rem 0;
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

        @media (max-width: 480px) {
          .policy-content h1 {
            font-size: 1.5rem;
          }

          .policy-content h2 {
            font-size: 1.25rem;
          }

          .policy-content h3 {
            font-size: 1.05rem;
          }
        }
      `}</style>
    </div>
  )
}

export default FooterPolicyClient