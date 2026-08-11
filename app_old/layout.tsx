import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, Geist, Geist_Mono, Cormorant_Garamond, Jost } from "next/font/google";
import "@/design-system/styles/globals.css"; // Single import for all styles

// Fraunces font (IndieKonnect display)
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
  variable: "--font-fraunces"
});

// Instrument Sans (IndieKonnect UI)
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-instrument-sans"
});

// Geist fonts (for compatibility)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Cormorant Garamond (for hero text)
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Jost font
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const FAVICON =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 466 790'><path fill='%23FFC72C' d='M30 0H436A30 30 0 0 1 466 30V600A30 30 0 0 1 436 630H406V506A31 31 0 0 0 344 506V656A39 39 0 0 1 266 656V588A31 31 0 0 0 204 588V685A40 40 0 0 1 124 685A31 31 0 0 0 62 685V790H31A31 31 0 0 1 0 759V30A30 30 0 0 1 30 0Z'/><circle cx='93' cy='619' r='25' fill='%230B4EA2'/><circle cx='235' cy='522' r='25' fill='%230B4EA2'/><circle cx='375' cy='440' r='25' fill='%230B4EA2'/></svg>";

export const metadata: Metadata = {
  title: "IndieKonnect — The Art of Opportunity",
  description:
    "A modern Indian movement built on Connection, Opportunity, Growth and Trust. One nation, one network, endless possibilities.",
  icons: { icon: FAVICON }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="en" 
      className={`${fraunces.variable} ${instrumentSans.variable} ${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}