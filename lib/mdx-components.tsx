import { MDXComponents } from 'mdx/types';
import Video from '@/components/mdx/Video';
import Link from 'next/link';
import Image from 'next/image';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Default components
    a: ({ href, ...props }) => (
      <Link href={href || ''} {...props} />
    ),
    img: ({ src, alt, ...props }) => (
      <Image 
        src={src || ''} 
        alt={alt || ''} 
        width={800} 
        height={400} 
        className="rounded-lg" 
        {...props} 
      />
    ),
    // Video component
    video: Video,
    // Any custom overrides passed in
    ...components,
  };
} 