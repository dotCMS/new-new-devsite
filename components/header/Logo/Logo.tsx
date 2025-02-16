'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LOGO_DEFAULT, LOGO_WIDTH, LOGO_HEIGHT, LOGO_ALT, LOGO_DEFAULT_DARK } from './config';
import { useTheme } from "next-themes";

export default function Logo() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Link href="/" className="max-w-[100px] flex items-center">
        <div className="w-[128px] h-[32px] bg-transparent" />
      </Link>
    );
  }

  return (
    <Link href="/" className="max-w-[100px] flex items-center">
      <Image
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className="md:mr-2 pl-1 md:pl-0"
        src={resolvedTheme === 'dark' ? LOGO_DEFAULT_DARK : LOGO_DEFAULT}
        alt={LOGO_ALT}
        priority={true}
      />
    </Link>
  );
};
