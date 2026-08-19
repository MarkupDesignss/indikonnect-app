
'use client'

import Header from '@/components/common/Header'
import Footer from '@/components/Footer/Footer'
import { useGetContentsQuery } from '@/lib/redux/api/Home/contentApi'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface ContentBlock {
  id: number
  heading: string
  short_description: string | null
  description: string
  sort_order: number
  images: Array<{ id: number; url: string; alt_text: string | null; is_primary: boolean }>
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

const Footerprivacy = () => {
  const params = useParams()
  const slug = params?.slug as string
  const { data: contentsData, isLoading, error } = useGetContentsQuery({})
  const [content, setContent] = useState<ContentData | null>(null)

  useEffect(() => {
    if (contentsData?.data && slug) {
      const found = contentsData.data.find(
        (item: ContentData) => item.slug === slug
      )
      setContent(found || null)
    }
  }, [contentsData, slug])

  const createMarkup = (html: string) => {
    return { __html: html }
  }

  const renderHeading = (heading: string) => {
    if (!heading) return null
    
    if (heading.includes('<h1') || heading.includes('<h2') || 
        heading.includes('<h3') || heading.includes('<h4')) {
      return <div dangerouslySetInnerHTML={createMarkup(heading)} />
    }
    
    const headingLevel = heading.startsWith('h1') ? 'h1' : 
                        heading.startsWith('h2') ? 'h2' : 
                        heading.startsWith('h3') ? 'h3' : 'h4'
    
    const HeadingTag = headingLevel as keyof JSX.IntrinsicElements
    const cleanText = heading.replace(/<h[1-4]>|<\/h[1-4]>/g, '').trim()
    
    return <HeadingTag className="text-[#1a1a2e] font-bold tracking-[-0.01em]">
      {cleanText}
    </HeadingTag>
  }

  if (isLoading) {
    return (
      <div>
        <Header />
        <div className="max-w-[880px] mx-auto px-6 py-10 md:px-4 md:py-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
            <div className="w-12 h-12 border-4 border-[#f9c744] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#9a97b0] text-[15px]">Loading content...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div>
        <Header />
        <div className="max-w-[880px] mx-auto px-6 py-10 md:px-4 md:py-6">
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center gap-4">
            <span className="text-7xl mb-2">📄</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e]">Content Not Found</h2>
            <p className="text-[#6b6882] text-lg max-w-[400px]">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Header />
      
      <main className="bg-white text-[#1a1a2e] min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#2d2b4a] to-[#3d3a5c] py-20 px-6 md:py-[60px] md:px-5 overflow-hidden text-center">
          <div className="absolute -top-[50%] -right-[20%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(249,199,68,0.08)_0%,transparent_70%)] animate-pulse-glow"></div>
          <div className="absolute -bottom-[30%] -left-[10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,123,191,0.06)_0%,transparent_70%)] animate-[pulseGlow_10s_ease-in-out_infinite_reverse]"></div>
          
          <div className="relative z-10 max-w-[800px] mx-auto">
            <span className="inline-block bg-[rgba(249,199,68,0.15)] text-[#f9c744] px-5 py-1.5 rounded-full text-[13px] font-semibold tracking-[2px] uppercase border border-[rgba(249,199,68,0.2)] mb-5 backdrop-blur-[10px]">
              Policy
            </span>
            <h1 className="text-white text-[clamp(2rem,5vw,3.5rem)] font-bold mb-4 leading-[1.15] tracking-[-0.02em]">
              {content.title}
            </h1>
            <p className="text-white/60 text-[15px] font-normal tracking-[0.3px]">
              Last updated: {new Date(content.updated_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f9c744] via-[#8b7bbf] via-[#c44a6a] to-[#4bbf8a] to-[#f9c744] bg-[length:200%_100%] animate-gradient-move"></div>
        </div>

        {/* Content */}
        <div className="max-w-[880px] mx-auto px-6 py-10 md:px-4 md:py-6 pb-20">
          {content.blocks.map((block) => (
            <div 
              key={block.id} 
              className="bg-[rgba(255,255,255,0.95)] backdrop-blur-[20px] rounded-2xl md:rounded-3xl p-6 md:p-10 lg:p-12 mb-8 shadow-[0_24px_80px_rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[rgba(249,199,68,0.25)] hover:shadow-[0_24px_80px_rgba(249,199,68,0.1)] hover:-translate-y-0.5"
            >
              {block.heading && (
                <div className="mb-5">
                  {renderHeading(block.heading)}
                </div>
              )}
              
              {block.short_description && (
                <div className="mb-6 text-[#6b6882]">
                  <div dangerouslySetInnerHTML={createMarkup(block.short_description)} />
                </div>
              )}
              
              {block.description && (
                <div className="policy-content">
                  <div dangerouslySetInnerHTML={createMarkup(block.description)} />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        
        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
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
          .policy-content h1 { font-size: 1.75rem; }
          .policy-content h2 { font-size: 1.4rem; }
          .policy-content h3 { font-size: 1.15rem; }
          .policy-content p, .policy-content li { font-size: 0.95rem; }
        }

        @media (max-width: 480px) {
          .policy-content h1 { font-size: 1.5rem; }
          .policy-content h2 { font-size: 1.25rem; }
          .policy-content h3 { font-size: 1.05rem; }
        }
      `}</style>
    </div>
  )
}

export default Footerprivacy