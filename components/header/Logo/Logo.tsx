'use client';


import Image from 'next/image';
import Link from 'next/link';
import { LOGO_DEFAULT, LOGO_WIDTH, LOGO_HEIGHT, LOGO_ALT, LOGO_DEFAULT_DARK } from './config';
import { useTheme } from "next-themes";

function Logo() {
  const { theme } = useTheme();

  
  return (
    <Link href="/" passHref className="flex items-center">
      <Image
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className="md:mr-2 pl-1 md:pl-0"
        src={theme === 'dark' ? LOGO_DEFAULT_DARK  : LOGO_DEFAULT }
        alt={LOGO_ALT}
        loading="lazy"
      />
    </Link>
  );
};

export default Logo;
