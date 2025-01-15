import type { MDXComponents } from '@mdx-js/mdx';
import Video from '@/components/mdx/Video';
import Link from 'next/link';
import Image from 'next/image';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Default components
    a: ({ href, ...props }: { href: string }) => (
      <Link href={href || ''} {...props} />
    ),
    img: ({ src, alt, ...props }: ImageProps) => {
        const thisHeight = props?.height ? Number(props?.height) : 400;
        const thisWidth = props?.width ? Number(props?.width) : 800;
        return (
            <Image 
                src={src || ''} 
                alt={alt || ''} 
                width={thisWidth}
                height={thisHeight}
                className="rounded-lg" 
                {...props} 
            />
        );
    },
    // Video component
    video: Video,
    // Any custom overrides passed in
    ...components,
  };
} 