'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';

// Lazy load heavy analytics components
const MicrosoftClarity = dynamic(
  () => import('@/components/metrics/MicrosoftClarity'),
  { ssr: false }
);

const LeadboxerScript = dynamic(
  () => import('@/components/metrics/Leadboxer').then(mod => mod.LeadboxerScript),
  { ssr: false }
);

export default function Analytics() {
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false);

  useEffect(() => {
    // Check if user has opted out of analytics
    const analyticsOptOut = localStorage.getItem('analytics-opt-out');
    if (analyticsOptOut === 'true') return;

    // Load analytics after page becomes interactive
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        setShouldLoadAnalytics(true);
      });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      const timer = setTimeout(() => {
        setShouldLoadAnalytics(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (!shouldLoadAnalytics) {
    return null;
  }

  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-CM1HLQW35G" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-CM1HLQW35G');`}
      </Script>
      <MicrosoftClarity />
      <LeadboxerScript />
    </>
  );
}