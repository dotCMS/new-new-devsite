'use client'

import React, { useEffect, useState } from 'react'
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
import Info from '@/components/mdx/Info'
import { CopyButton } from './chat/CopyButton'
import { a11yLight, dark, docco, a11yDark, vs } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { useTheme } from "next-themes"
import Warn from '@/components/mdx/Warn'
import { Include } from '@/components/mdx/Include'
import { remarkCustomId } from '@/util/remarkCustomId'
import { visit } from 'unist-util-visit'

// Store raw content for info/warn components
const rawContentMap = new Map<string, string>();

// Simple preprocessing to extract Info/Warn content before react-markdown processes it
function extractInfoWarnContent(content: string): string {
  let processed = content;
  
  // Handle Info/info components
  processed = processed.replace(/<(Info|info)([^>]*)>([\s\S]*?)<\/(Info|info)>/gi, (match, openTag, attributes, innerContent, closeTag) => {
    const id = `info_${Date.now()}_${Math.random()}`;
    rawContentMap.set(id, innerContent.trim());
    return `<info data-content-id="${id}"${attributes}></info>`;
  });
  
  // Handle Warn/warn components  
  processed = processed.replace(/<(Warn|warn)([^>]*)>([\s\S]*?)<\/(Warn|warn)>/gi, (match, openTag, attributes, innerContent, closeTag) => {
    const id = `warn_${Date.now()}_${Math.random()}`;
    rawContentMap.set(id, innerContent.trim());
    return `<warn data-content-id="${id}"${attributes}></warn>`;
  });
  
  return processed;
}

// Rehype plugin to unwrap info/warn components from paragraphs
function rehypeUnwrapInfoWarn() {
  return (tree: any) => {
    visit(tree, 'element', (node, index, parent) => {
      // Look for paragraphs that contain info or warn elements
      if (node.tagName === 'p' && node.children && parent && typeof index === 'number') {
        let hasInfoWarn = false;
        const infoWarnElements: any[] = [];
        const otherContent: any[] = [];

        // Separate info/warn elements from other content
        node.children.forEach((child: any) => {
          if (child.type === 'element' && (child.tagName === 'info' || child.tagName === 'warn')) {
            hasInfoWarn = true;
            infoWarnElements.push(child);
          } else if (child.type === 'text' && child.value.trim() === '') {
            // Skip empty text nodes
          } else {
            otherContent.push(child);
          }
        });

        if (hasInfoWarn) {
          const replacements: any[] = [];
          
          // If there's other content, keep it in a paragraph
          if (otherContent.length > 0) {
            replacements.push({
              type: 'element',
              tagName: 'p',
              properties: node.properties,
              children: otherContent
            });
          }
          
          // Add info/warn elements as block elements
          replacements.push(...infoWarnElements);
          
          // Replace the original paragraph with the separated elements
          parent.children.splice(index, 1, ...replacements);
          
          // Return the new index to continue processing
          return index + replacements.length - 1;
        }
      }
    });
  };
}

interface MarkdownContentProps {
  content: string
  className?: string
  disableInfoWarn?: boolean
}

type ExtendedComponents = Components & {
  info: React.ComponentType<ComponentPropsWithoutRef<'div'>>,
  warn: React.ComponentType<ComponentPropsWithoutRef<'div'>>,
  include: React.ComponentType<{ urltoinclude: string }>
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

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className, disableInfoWarn = false }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const components: ExtendedComponents = {
    h1: ({ node, children, ...props }) => (
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
    ),
    h2: ({ children, ...props }) => (
      <>
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
      </>
    ),
    h3: ({ children, ...props }) => (
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
    ),
    h4: ({ children, ...props }) => (
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
    ),
    h5: ({ children, ...props }) => (
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
    ),
    h6: ({ children, ...props }) => (
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
    ),
    p: ({ children }) => (
      <p className="text-base leading-7 text-foreground mb-6">{children}</p>
    ),
    ul: ({ children }) => <ul className="list-disc pl-6 mb-6">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
    li: ({ children }) => (
      <li className="text-base leading-7 text-foreground mb-1">{children}</li>
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

    code: ({ node, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      const inline = !String(children).includes("\n");
      const highlight = match ? match[1] : "html";

      if (inline) {
        return (
          <code 
            className="bg-muted text-foreground text-sm font-mono px-1 py-0.5 rounded whitespace-normal" 
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
            <pre className="rounded-lg py-2 border border-border bg-muted p-4 pt-8 pb-8 text-sm font-mono overflow-x-auto">
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
    info: disableInfoWarn ? (() => null) : ({ 'data-content-id': contentId, ...props }: any) => {
      const rawContent = contentId ? rawContentMap.get(contentId) : null;
      return <Info rawContent={rawContent} {...props} />;
    },
    warn: disableInfoWarn ? (() => null) : ({ 'data-content-id': contentId, ...props }: any) => {
      const rawContent = contentId ? rawContentMap.get(contentId) : null;
      return <Warn rawContent={rawContent} {...props} />;
    },
    include: ({ urltoinclude }: any) => {
      return <Include urlToInclude={urltoinclude} />;
    },
  }

  // Extract Info/Warn content before react-markdown processes it
  const processedContent = disableInfoWarn ? content : extractInfoWarnContent(content);

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

  // Add info/warn unwrap plugin if not disabled
  if (!disableInfoWarn) {
    rehypePlugins.splice(1, 0, [rehypeUnwrapInfoWarn]);
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
