"use client";

import React, { useEffect, useState } from "react";
import Logo from "./Logo";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/util/utils";

/**
 * Logo with a “back to dotCMS.com” affordance on hover.
 * The arrow sits in reserved left space inside the header padding so it
 * never paints past the viewport edge.
 */
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

  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  return (
    <div
      className="group relative flex items-center"
      onMouseEnter={handleLogoMouseEnter}
      onMouseLeave={handleLogoMouseLeave}
    >
      <div
        className={cn(
          "mr-1 flex w-7 shrink-0 items-center justify-center transition-opacity duration-200",
          showBackArrow ? "opacity-75" : "pointer-events-none opacity-0"
        )}
      >
        <a
          href="https://www.dotcms.com"
          className="block p-1 hover:text-primary"
          aria-label="Back to dotCMS.com"
          title="Back to dotCMS.com"
          tabIndex={showBackArrow ? 0 : -1}
        >
          <ArrowLeft className="h-5 w-5" />
        </a>
      </div>
      <div className="max-w-[100px]">
        <Logo />
      </div>
    </div>
  );
}
