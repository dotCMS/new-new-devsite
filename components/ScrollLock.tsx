"use client";

import { useEffect } from 'react';

export function ScrollLock() {
  useEffect(() => {
    const initialScroll = window.scrollY;
    
    const restore = () => {
      window.scrollTo(0, initialScroll);
    };

    window.addEventListener('scroll', restore, { once: true });
    return () => window.removeEventListener('scroll', restore);
  }, []);
  
  return null;
}