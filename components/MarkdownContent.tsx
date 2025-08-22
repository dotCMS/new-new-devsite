'use client'

import React, { useEffect, useState, createContext, useContext } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Components } from 'react-markdown'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { smoothScroll } from '@/util/smoothScroll'
import Video from '@/components/mdx/Video'
import { CopyButton } from './chat/CopyButton'
import { a11yLight, dark, docco, a11yDark, vs } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { useTheme } from "next-themes"
import { Include } from '@/components/mdx/Include'
import { remarkCustomId } from '@/util/remarkCustomId'
import { 
  extractBlockComponentContent, 
  rehypeUnwrapBlockComponents,
  generateBlockComponentMappings
} from './block-components-system'

interface MarkdownContentProps {
  content: string
  className?: string
  disableBlockComponents?: boolean // Renamed from disableInfoWarn
}

type ExtendedComponents = Components & {
  include: React.ComponentType<{ urltoinclude: string }>
  // Block components are added dynamically
}

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: number;
  children: React.ReactNode;
}

interface ChildrenProps {
  children: ReactNode;
}

const HEADER_HEIGHT = 80;
const BREADCRUMB_HEIGHT = 48; // 24px height + 24px bottom margin
const TOTAL_OFFSET = HEADER_HEIGHT + BREADCRUMB_HEIGHT;

// Context to track if we're inside a list item
const ListItemContext = createContext(false);

// Context to track if we're inside a heading
const HeadingContext = createContext(false);

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className, disableBlockComponents = false }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const components: ExtendedComponents = {
    h1: ({ node, children, ...props }) => (
      <HeadingContext.Provider value={true}>
        <h1 
          className="text-4xl font-bold mt-6 mb-4 group flex items-center relative" 
          style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
          {...props}
        >
          {children}
          <a 
            href={`#${props.id}`}
            onClick={smoothScroll}
            className="absolute -left-5 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Link to section"
          >
            #
          </a>
        </h1>
      </HeadingContext.Provider>
    ),
    h2: ({ children, ...props }) => (
      <HeadingContext.Provider value={true}>
        <h2 
          className="text-3xl font-semibold text-foreground mt-12 mb-1 group flex items-center relative" 
          style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
          {...props}
        >
          {children}
          <a 
            href={`#${props.id}`}
            onClick={smoothScroll}
            className="absolute -left-5 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Link to section"
          >
            #
          </a>
        </h2>
        <hr className="border-t border-border mb-6" />
      </HeadingContext.Provider>
    ),
    h3: ({ children, ...props }) => (
      <HeadingContext.Provider value={true}>
        <h3 
          className="text-2xl font-semibold text-foreground mt-8 mb-4 group flex items-center relative" 
          style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
          {...props}
        >
          {children}
          <a 
            href={`#${props.id}`}
            onClick={smoothScroll}
            className="absolute -left-5 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Link to section"
          >
            #
          </a>
        </h3>
      </HeadingContext.Provider>
    ),
    h4: ({ children, ...props }) => (
      <HeadingContext.Provider value={true}>
        <h4 
          className="text-xl font-semibold text-foreground mt-6 mb-4 group flex items-center relative" 
          style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
          {...props}
        >
          {children}
          <a 
            href={`#${props.id}`}
            onClick={smoothScroll}
            className="absolute -left-5 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Link to section"
          >
            #
          </a>
        </h4>
      </HeadingContext.Provider>
    ),
    h5: ({ children, ...props }) => (
      <HeadingContext.Provider value={true}>
        <h5 
          className="text-lg font-semibold text-foreground mt-4 mb-2 group flex items-center relative" 
          style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
          {...props}
        >
          {children}
          <a 
            href={`#${props.id}`}
            onClick={smoothScroll}
            className="absolute -left-5 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Link to section"
          >
            #
          </a>
        </h5>
      </HeadingContext.Provider>
    ),
    h6: ({ children, ...props }) => (
      <HeadingContext.Provider value={true}>
        <h6 
          className="text-base font-medium mt-2 mb-1 group flex items-center relative" 
          style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
          {...props}
        >
          {children}
          <a 
            href={`#${props.id}`}
            onClick={smoothScroll}
            className="absolute -left-5 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Link to section"
          >
            #
          </a>
        </h6>
      </HeadingContext.Provider>
    ),
    p: function ParagraphComponent({ children, ...props }) {
      const isInListItem = useContext(ListItemContext);
      return (
        <p className={`text-base leading-7 text-foreground ${isInListItem ? 'mb-0' : 'mb-6'}`}>
          {children}
        </p>
      );
    },
    ul: function UnorderedListComponent({ children }) {
      const isInListItem = useContext(ListItemContext);
      return (
        <ul className={`list-disc list-outside pl-6 ${isInListItem ? 'mb-1' : 'mb-6'}`}>
          {children}
        </ul>
      );
    },
    ol: function OrderedListComponent({ children }) {
      const isInListItem = useContext(ListItemContext);
      return (
        <ol className={`list-decimal list-outside pl-6 ${isInListItem ? 'mb-1' : 'mb-6'}`}>
          {children}
        </ol>
      );
    },
    li: ({ children }) => (
      <ListItemContext.Provider value={true}>
        <li className="text-base leading-7 text-foreground mb-1">{children}</li>
      </ListItemContext.Provider>
    ),
    a: ({ href, children, ...props }) => {
      const isInHeading = href?.startsWith('#');

      return (
        <a
          href={href}
          className={isInHeading 
            ? `text-foreground` 
            : `text-primary-purple hover:opacity-80 underline hover:no-underline`}
          onClick={(e) => isInHeading ? smoothScroll(e) : undefined}
        >
          {children}
        </a>
      )
    },

    code: function CodeComponent({ node, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
      const inline = !String(children).includes("\n");
      const highlight = match ? match[1] : "html";

      // Check if code is inside a heading using React context
      const isInHeading = useContext(HeadingContext);

      if (inline) {
        return (
          <code 
            className={`bg-muted text-foreground font-mono px-1 py-0.5 rounded whitespace-normal ${isInHeading ? '' : 'text-sm'}`}
            {...props}
          >
            {children}
          </code>
        )
      } 

      // Prevent hydration mismatch by not rendering theme-dependent content until mounted
      if (!mounted) {
        return (
          <div className="mb-6 relative">
            <pre className={`rounded-lg py-2 border border-border bg-muted p-4 pt-8 pb-8 font-mono overflow-x-auto ${isInHeading ? '' : 'text-sm'}`}>
              <code>{String(children).replace(/\n$/, '')}</code>
            </pre>
          </div>
        );
      }

      return (
        <div className="mb-6 relative">
          <div className="absolute right-3 top-3 z-10">
            <CopyButton 
              text={String(children)} 
              variant="outline"
              className="bg-background hover:bg-accent text-foreground hover:text-accent-foreground" 
            />
          </div>
          <SyntaxHighlighter
            language={highlight}
            PreTag="div"
            style={theme === 'dark' ? a11yDark : a11yLight}
            className="rounded-lg py-2 [&>pre]:!m-0 border border-border [&>pre]:!bg-muted"
            customStyle={{
              padding: '1rem',
              paddingTop: '2rem',
              paddingBottom: '2rem',
              fontSize: '14px',
              backgroundColor: 'transparent', // Use transparent to let CSS handle the background
            }}
            {...props}
          >{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
        </div>
      );
    },

    table({ children }) {
      return (
        <Table className="border-border border border-collapse mb-6">{children}</Table>
      )
    },
    thead({ children }) {
      // Check if thead has any content
      const hasContent = React.Children.toArray(children).some((child: any) => {
        if (!child.props?.children) return false;
        // Check if there's any text content in the th cells
        return React.Children.toArray(child.props.children).some((th: any) => 
          th.props?.children && th.props.children.length > 0
        );
      });

      return hasContent ? <TableHeader>{children}</TableHeader> : null;
    },
    tbody({ children }) {
      return <TableBody>{children}</TableBody>
    },
    tr({ children }) {
      return <TableRow>{children}</TableRow>
    },
    th({ children }) {
      return <TableHead className="text-[15px] font-semibold bg-muted px-4 border-border border-r last:border-r-0">
        {children}
      </TableHead>
    },
    td({ children }) {
      return <TableCell className="text-base leading-7 text-foreground px-4 border-border border-r last:border-r-0">
        {children}
      </TableCell>
    },
    hr: () => <hr className="border-t border-border mb-6" />,

    img: ({ src, alt, ...props }: any) => (
      <img 
        src={src} 
        alt={alt} 
        className="inline rounded-lg max-w-full h-auto"
        {...props} 
      />
    ),

    video: ({ node, ...props }: any) => {
      if (!node?.children) return null;
      
      const sources = node.children
        .filter((child: any) => child.tagName === 'source')
        .map((source: any) => {
          let src = source.properties?.src;
          // Handle DotCMS URLs
          if (src && src.startsWith('/dA/')) {
            src = `https://dev.dotcms.com${src}`;
          }
          return {
            src,
            type: source.properties?.type?.split('?')[0] || 'video/mp4'
          };
        });

      if (sources.length === 0) return null;

      return (
        <video
          className="rounded-lg w-full mb-4"
          width="100%"
          height="auto"
          controls
          autoPlay
          loop
          playsInline
          muted
        >
          {sources.map((source: { src: string; type: string }, index: number) => (
            <source key={index} src={source.src} type={source.type} />
          ))}
          Your browser does not support the video tag.
        </video>
      );
    },

    include: ({ urltoinclude }: any) => {
      return <Include urlToInclude={urltoinclude} />;
    },

    // Dynamically generated block component mappings
    ...generateBlockComponentMappings(disableBlockComponents),
  }

  // Extract block component content before react-markdown processes it
  const processedContent = disableBlockComponents ? content : extractBlockComponentContent(content);

  // Build rehype plugins array
  const rehypePlugins: any[] = [
    [rehypeRaw],
    [rehypeSlug],
    [rehypeAutolinkHeadings, { 
      behavior: 'wrap',
      properties: {
        className: ['anchor'],
        'data-heading-id': true,
        style: 'scroll-margin-top: 80px;'
      }
    }]
  ];

  // Add block component unwrap plugin if not disabled
  if (!disableBlockComponents) {
    rehypePlugins.splice(1, 0, [rehypeUnwrapBlockComponents]);
  }

  return (
    <ReactMarkdown 
      rehypePlugins={rehypePlugins}
      remarkPlugins={[remarkGfm, remarkCustomId]}
      components={components}
      className={className}
    >
      {processedContent}
    </ReactMarkdown>
  )
}

export default MarkdownContent
