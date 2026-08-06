import type { Metadata } from "next";
import "./global.css";  // ✅ CSS import - important!
import { ReduxProvider } from "../lib/providers/ReduxProvider";

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
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}