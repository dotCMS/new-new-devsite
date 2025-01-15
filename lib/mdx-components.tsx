import type { MDXComponents } from 'mdx/types';
import Video from '@/components/mdx/Video';
import Link from 'next/link';
import Image from 'next/image';
import { DetailedHTMLProps, ImgHTMLAttributes } from 'react';

type MDXImageProps = DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href = '', ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <Link href={href} {...props} />
    ),
    img: (props: MDXImageProps) => {
      let finalWidth = 800;
      let finalHeight = 400;

      if (props.width) {
        finalWidth = typeof props.width === 'string' ? parseInt(props.width, 10) : props.width;
      }
      if (props.height) {
        finalHeight = typeof props.height === 'string' ? parseInt(props.height, 10) : props.height;
      }

      const { width, height, ...restProps } = props;

      return (
        <Image 
          src={props.src || ''} 
          alt={props.alt || ''} 
          width={finalWidth}
          height={finalHeight}
          className="rounded-lg" 
          {...restProps} 
        />
      );
    },
    video: Video,
    ...components,
  };
} 