'use client';
import { type FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LOGO_DEFAULT, LOGO_WIDTH, LOGO_HEIGHT, LOGO_ALT, LOGO_DEFAULT_DARK } from './config';
import { type TLogo } from './types';
import { useTheme } from '@/context/ThemeContext';

export const Logo: FC<TLogo> = ({ initialLogoDarkUrl, initialLogoUrl, link = '/' }) => {
  const { theme } = useTheme();

  return (
    <Link href={link} passHref className="flex items-center">
      <Image
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className="md:mr-2 pl-1 md:pl-0"
        src={theme === 'light' ? initialLogoUrl || LOGO_DEFAULT : initialLogoDarkUrl || LOGO_DEFAULT_DARK}
        alt={LOGO_ALT}
        loading="lazy"
      />
    </Link>
  );
};

export default Logo;
