import type { Metadata } from "next";
import "./global.css";
import { ReduxProvider } from "@/lib/providers/ReduxProvider";
import { Toast } from "@/components/ui/Toast";
import ScrollToTop from "@/components/common/ScrollToTop";

export const metadata: Metadata = {
  title: "IndieKonnect",
  description: "One Nation, One Network, Endless Possibilities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts - Loaded here for proper rendering */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Jost:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="w-full min-h-screen antialiased">
        <ReduxProvider>
          {/* Scroll page to top whenever route changes */}
          <ScrollToTop />

          {children}

          {/* Global Toast Component - renders in top-right */}
          <Toast />
        </ReduxProvider>
      </body>
    </html>
  );
}