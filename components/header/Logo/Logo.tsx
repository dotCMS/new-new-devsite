'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LOGO_DEFAULT, LOGO_WIDTH, LOGO_HEIGHT, LOGO_ALT, LOGO_DEFAULT_DARK } from './config';

export default function Logo() {
  return (
    <Link href="/" className="max-w-[100px] flex items-center relative w-[128px]">
      <div className="w-[128px] h-[32px]" aria-hidden="true" />
      <Image
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className="md:mr-2 pl-1 md:pl-0 transition-opacity duration-200 absolute dark:opacity-0 opacity-100"
        src={LOGO_DEFAULT}
        alt={LOGO_ALT}
        priority={true}
      />
      <Image
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className="md:mr-2 pl-1 md:pl-0 transition-opacity duration-200 absolute dark:opacity-100 opacity-0"
        src={LOGO_DEFAULT_DARK}
        alt={LOGO_ALT}
        priority={true}
      />
    </Link>
  );
};
