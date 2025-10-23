import './globals.css';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { Providers } from '@/providers/providers';
import { ToastProvider } from '@/components/providers/toast-provider';

const montserrat = Montserrat({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat'
});

export const metadata: Metadata = {
  title: {
    default: 'Synergio - Modern E-commerce Excellence',
    template: '%s | Synergio'
  },
  description: 'A production-ready, full-featured e-commerce platform with modern design and comprehensive functionality.',
  keywords: 'ecommerce, online store, shopping, Uganda, products',
  authors: [{ name: 'Synergio Team' }],
  creator: 'Synergio',
  publisher: 'Synergio',
  robots: {
    index: true,
    follow: true
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Synergio',
    title: 'Synergio - Modern E-commerce Excellence',
    description: 'A production-ready, full-featured e-commerce platform with modern design and comprehensive functionality.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Synergio Platform'
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synergio - Modern E-commerce Excellence',
    description: 'A production-ready, full-featured e-commerce platform with modern design and comprehensive functionality.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Synergio",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://synergio.com",
              "description": "A production-ready, full-featured e-commerce platform with modern design and comprehensive functionality.",
              "publisher": {
                "@type": "Organization",
                "name": "Synergio",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://synergio.com"}/logo.png`
                }
              }
            })
          }}
        />
      </head>
      <body className={montserrat.className}>
        <ToastProvider>
          <Providers>
            {children}
          </Providers>
        </ToastProvider>
      </body>
    </html>
  );
}