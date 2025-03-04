import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/header/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import { GoogleAnalytics } from '@next/third-parties/google'
import { ScrollLock } from '@/components/ScrollLock';
import { AlertBanner } from '@/components/AlertBanner';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export const metadata: Metadata = {
  title: {
    template: '%s | dotCMS Dev Site',
    default: 'dotCMS Dev Site',
  },
  description: 'dotCMS Dev Site and Resources - Learn about dotCMS\'s core concepts, features, and best practices',
  metadataBase: new URL('https://dev.dotcms.com'),
  publisher: 'dotCMS',
  icons: {
    icon: '/static/favicon.ico',
    shortcut: '/static/favicon.ico',
    apple: '/static/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'dotCMS Dev Site',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@dotcms',
    site: '@dotcms',
    title: 'dotCMS Dev Site',
    description: 'dotCMS Dev Site and Resources - Learn about dotCMS\'s core concepts, features, and best practices',
    images: ['https://dev.dotcms.com/dA/a6e0a89831/70q/1000maxw/dotcms-dev-site.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ScrollLock />
            <AlertBanner 
              message={
                <>
                  dotCMS is now licensed under the BSL 1.1 and is free to use in many cases. <a href="https://www.dotcms.com/bsl-faq" className="underline font-medium hover:text-blue-200">Learn more here</a>.
                </>
              } 
            />
            {children}
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
        <GoogleAnalytics gaId="G-CM1HLQW35G" />
      </body>
    </html>
  );
}
