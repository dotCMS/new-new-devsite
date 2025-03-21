"use client";

import { useEffect, useLayoutEffect } from 'react';

// Create a client-side only useLayoutEffect
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Constants for header height only - banner is now in normal document flow
const HEADER_HEIGHT = 80;

export function InitialScroll() {
  useIsomorphicLayoutEffect(() => {
    if (!window.location.hash) return;

    const scrollToElement = () => {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      
      if (!element) return;

      // Calculate target position accounting for header only
      const elementRect = element.getBoundingClientRect();
      const targetScrollPos = window.scrollY + elementRect.top - HEADER_HEIGHT;

      // If we're already at the right position (within 5px), do nothing
      if (Math.abs(window.scrollY - targetScrollPos) <= 5) return;

      // Apply our scroll adjustment
      window.scrollTo({
        top: targetScrollPos,
        behavior: 'instant'
      });
    };

    // Handle both initial load and hash changes
    scrollToElement();

    // Listen for hash changes
    window.addEventListener('hashchange', scrollToElement);

    return () => {
      window.removeEventListener('hashchange', scrollToElement);
    };
  }, []); // Empty dependency array means this runs once on mount

  return null;
} 