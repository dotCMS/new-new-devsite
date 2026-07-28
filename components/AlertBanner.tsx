"use client";

import { useEffect, useState, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';

interface AlertBannerProps {
  message: ReactNode;
  storageKey?: string;
}

export function AlertBanner({ 
  message, 
  storageKey = 'alert-banner-dismissed' 
}: AlertBannerProps) {
  // Start with null to avoid hydration issues
  const [isVisible, setIsVisible] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the banner has been dismissed before
    const isDismissed = localStorage.getItem(storageKey) === 'true';
    setIsVisible(!isDismissed);
  }, [storageKey]);

  // Don't render anything during SSR or before localStorage check
  if (isVisible === null) return null;

  const dismissBanner = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="w-full">
      <Alert className="relative m-0 rounded-none border-none px-4 py-3 text-white" style={{ backgroundColor: 'rgb(24, 24, 109)' }}>
        <AlertDescription className="w-full text-center text-white">
          {message}
        </AlertDescription>
        <button
          onClick={dismissBanner}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Close alert"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </Alert>
    </div>
  );
}
