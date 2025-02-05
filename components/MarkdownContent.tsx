'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Components } from 'react-markdown'
import { remarkRemoveAnchorLinks } from '@/util/remarkRemoveAnchorLinks'
import { smoothScroll } from '@/util/smoothScroll'
import Video from '@/components/mdx/Video'


interface MarkdownContentProps {
  content: string
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {

  const components: Components = {
    h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mb-4" {...props} />,
    h2: ({ node, ...props }) => (
      <h2 className="text-3xl font-bold mt-8 mb-4" id={node.properties?.id} {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-2xl font-bold mt-6 mb-3" id={node.properties?.id} {...props} />
    ),
    h4: ({ children, ...props }) => (
      <h4 className="text-xl font-semibold text-foreground mt-6 mb-4 group flex items-center" {...props}>
        {children}
        <a href={`#${props.id}`} onClick={smoothScroll} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </a>
      </h4>
    ),
    h5: ({ children, ...props }) => (
      <h5 className="text-lg font-semibold text-foreground mt-4 mb-2 group flex items-center" {...props}>
        {children}
        <a href={`#${props.id}`} onClick={smoothScroll} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </a>
      </h5>
    ),
    h6: ({ children, ...props }) => (
      <h6 className="text-base font-medium mt-2 mb-1 group flex items-center" {...props}>
        {children}
        <a href={`#${props.id}`} onClick={smoothScroll} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </a>
      </h6>
    ),
    p: ({ children }) => <p className="text-[15px] leading-7 text-foreground mb-6">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 mb-6">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
    li: ({ children }) => <li className="text-[15px] leading-7 text-foreground mb-1">
      {children}
    </li>,
    a: ({ node, children, href, ...props }) => {
      if (href?.startsWith('#')) {
        return <span className="anchor-wrapper">{children}</span>;
      }
      return (
        <a
          href={href}
          className="text-blue-600 underline hover:no-underline"
          {...props}
        >
          {children}
        </a>
      );
    },
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <div className="mb-6">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            className="rounded-md [&>pre]:!m-0"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-[#F6F6F7] text-[#000000] text-sm font-mono px-1 py-0.5 rounded whitespace-normal" {...props}>
          {children}
        </code>
      )
    },
    pre({ node, children, ...props }: any) {
      const childNode = node?.children[0]
      const isCodeBlock = childNode?.tagName === 'code' && /language-(\w+)/.test(childNode.properties.className?.[0] || '')

      if (isCodeBlock) {
        // This is a code block, so we'll let the `code` component handle it
        return <>{children}</>
      } else {
        // This is a regular <pre> tag, likely containing HTML
        return (
          <pre className="bg-[#F6F6F7] text-[#000000] rounded-md p-4 mb-6 overflow-x-auto" {...props}>
            {children}
          </pre>
        )
      }
    },
    table({ children }) {
      return (
        <Table className="border-[#E5E7EB] border border-collapse mb-6">{children}</Table>
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
      return <TableHead className="text-[15px] font-semibold bg-[#F9FAFB] px-4 border-[#E5E7EB] border-r last:border-r-0">
        {children}
      </TableHead>
    },
    td({ children }) {
      return <TableCell className="text-[15px] leading-7 px-4 border-[#E5E7EB] border-r last:border-r-0">
        {children}
      </TableCell>
    },
    hr: () => <hr className="border-t border-[#E5E7EB] mb-6" />,
    video: ({ children, ...props }: any) => {
      // Ensure children is an array and handle rehype-raw parsed elements
      const childrenArray = React.Children.toArray(children);

      const sources = childrenArray.some((child: any) =>
        child.type === 'source' ||
        (typeof child === 'object' && child?.props?.originalType === 'source')
      )
        ? childrenArray
          .filter((child: any) =>
            child.type === 'source' ||
            (typeof child === 'object' && child?.props?.originalType === 'source')
          )
          .map((source: any) => ({
            src: source.props?.src || source.props?.originalProps?.src,
            type: source.props?.type || source.props?.originalProps?.type
          }))
        : undefined;

      const src = sources?.[0]?.src || props.src;
          
      // Handle DotCMS URL format

      const hasHost = src && (src.startsWith('http://') || src.startsWith('//') || src.startsWith("https://"))
      const videoSrc = hasHost ? src : process.env.NEXT_PUBLIC_DOTCMS_HOST + src;

      const videoProps = {
        src: videoSrc,
        className: "w-full mb-4",
        ...props
      };

      return <Video {...videoProps} />;
    }
  }

  return (
    <ReactMarkdown
      rehypePlugins={[
        rehypeRaw,
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }]
      ]}
      remarkPlugins={[remarkGfm, remarkRemoveAnchorLinks]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownContent

