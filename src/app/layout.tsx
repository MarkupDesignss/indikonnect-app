import type { Metadata } from "next";
import "@/app/global.css";

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
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Jost:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="min-h-screen w-full antialiased">
        <ReduxProvider>
          {/* Route scroll reset + scroll-progress back-to-top button */}
          <ScrollToTop />

          {children}

          <Toast />
        </ReduxProvider>
      </body>
    </html>
  );
}
