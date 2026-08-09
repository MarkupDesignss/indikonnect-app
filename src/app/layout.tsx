// src/app/layout.tsx

import type { Metadata } from "next";
import "./global.css"
import { ReduxProvider } from "@/lib/providers/ReduxProvider";

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
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
