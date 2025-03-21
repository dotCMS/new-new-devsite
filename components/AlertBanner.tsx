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
    <div className="bg-primary-purple text-white px-4 py-2 text-center text-sm">
      {message}
    </div>
  );
}
