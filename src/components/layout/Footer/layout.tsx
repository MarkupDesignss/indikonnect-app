import type { Metadata } from "next";
import { Playfair_Display, Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";

// "Art of" — refined display serif
const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-display",
});

// "Opportunity" — flowing italic serif (closest free match to a bold script)
const bodoni = Bodoni_Moda({
    subsets: ["latin"],
    weight: ["600", "700", "800"],
    style: ["italic"],
    variable: "--font-script",
});

// Nav / body / UI sans
const jost = Jost({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600"],
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: "IndieKonnect — Art of Opportunity",
    description:
        "A modern Indian movement built on Connection, Opportunity, Growth and Trust, where the spirit of 1.4 billion meets the power of entrepreneurship.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
                className={`${playfair.variable} ${bodoni.variable} ${jost.variable} font-sans bg-ink-950`}
            >
                {children}
            </body>
        </html>
    );
}
