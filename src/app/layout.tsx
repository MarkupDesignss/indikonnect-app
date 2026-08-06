import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import "./global.css";
import { ReduxProvider } from '@/lib/providers/ReduxProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IndiKonnect - Professional Network',
  description: 'Connect, Collaborate, and Grow professionally',
  keywords: 'professional network, collaboration, business',
  authors: [{ name: 'IndiKonnect Team' }],
  openGraph: {
    title: 'IndiKonnect - Professional Network',
    description: 'Connect, Collaborate, and Grow professionally',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'IndiKonnect',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#22c55e',
                  color: '#fff',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}