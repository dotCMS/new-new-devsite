"use client";

import { useEffect } from 'react';

export function ScrollLock() {
  useEffect(() => {
    const initialScroll = window.scrollY;
    console.log('ScrollLock initialized:', {
      initialScroll,
      timestamp: new Date().toISOString(),
      documentHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight
    });

    const restore = () => {
      const currentScroll = window.scrollY;
      const delta = currentScroll - initialScroll;
      
      // Only look at elements near the scroll position
      const relevantElements = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const rect = el.getBoundingClientRect();
          const absoluteTop = rect.top + window.scrollY;
          // Look at elements around the scroll position (±100px)
          return Math.abs(absoluteTop - currentScroll) < 100;
        })
        .map(el => ({
          element: el.tagName,
          id: el.id,
          className: el.className,
          top: el.getBoundingClientRect().top + window.scrollY,
          height: el.getBoundingClientRect().height
        }))
        .sort((a, b) => a.top - b.top); // Sort by position

      console.log('Scroll prevented:', {
        from: initialScroll,
        attempted: currentScroll,
        delta,
        timestamp: new Date().toISOString(),
        relevantElements
      });
      
      window.scrollTo(0, initialScroll);
    };

    window.addEventListener('scroll', restore, { once: true });
    return () => window.removeEventListener('scroll', restore);
  }, []);
  
  return null;
}