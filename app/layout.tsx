import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/header/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import { GoogleAnalytics } from '@next/third-parties/google';
import { AlertBanner } from '@/components/AlertBanner';
import MicrosoftClarity from '@/components/metrics/MicrosoftClarity';
import { InitialScroll } from '@/components/InitialScroll';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { LeadboxerScript } from '@/components/metrics/Leadboxer';
import { DotContentAnalytics } from "@dotcms/analytics/react";
import { AnalyticsConfig } from '@/util/config';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AlertBanner 
              message={
                <>
                  dotCMS is now licensed under the BSL 1.1 and is free to use in many cases. <a href="https://www.dotcms.com/bsl-faq" className="underline font-medium hover:text-blue-200">Learn more here</a>.
                </>
              } 
            />
            <InitialScroll />
            {children}
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
        <DotContentAnalytics config={AnalyticsConfig} />
        <GoogleAnalytics gaId="G-CM1HLQW35G" />
        <MicrosoftClarity />
        <LeadboxerScript />
        <SpeedInsights />
      </body>
    </html>
  );
}
