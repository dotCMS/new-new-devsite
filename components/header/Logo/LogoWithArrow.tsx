'use client';

import React, { useState } from 'react';
import Logo from './Logo';
import { ArrowLeft } from 'lucide-react';


export default function LogoWithArrow() {


    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
    const [showBackArrow, setShowBackArrow] = useState(false);

    const handleLogoMouseEnter = () => {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        setShowBackArrow(true);
      };
    
      const handleLogoMouseLeave = () => {
        const timeout = setTimeout(() => {
          setShowBackArrow(false);
        }, 2000);
        setHoverTimeout(timeout);
      };
    
    

  return (
    <div
    className="flex items-center relative group"
    onMouseEnter={handleLogoMouseEnter}
    onMouseLeave={handleLogoMouseLeave}
  >
    <div
      className={`absolute right-full mr-2 transition-opacity duration-2000 z-[60] ${
        showBackArrow ? "opacity-75" : "opacity-0 pointer-events-none"
      }`}
    >
      <a
        href="https://www.dotcms.com"
        className="hover:text-primary p-2 block"
        aria-label="Back to dotCMS.com"
        title="Back to dotCMS.com"
      >
        <ArrowLeft className="h-6 w-6" />
      </a>
    </div>
    <div className="max-w-[100px]">
      <Logo />
    </div>
  </div>
  );
}
