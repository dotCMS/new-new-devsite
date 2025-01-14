'use client'

import React, { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Components } from 'react-markdown'
import { remarkRemoveAnchorLinks } from '@/lib/remarkRemoveAnchorLinks'
import { smoothScroll } from '@/lib/smoothScroll'


interface MarkdownContentProps {
  content: string
}


const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {

  const components: Components = {
    h1: ({ children, ...props }) => (
      <h1 className="text-4xl font-bold mt-6 mb-4 group flex items-center" {...props}>
        {children}
        <a href={`#${props.id}`} onClick={smoothScroll} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </a>
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <>
        <h2 className="text-3xl font-semibold text-[#111827] mt-12 mb-1 group flex items-center" {...props}>
          {children}
          <a href={`#${props.id}`} onClick={smoothScroll} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            #
          </a>
        </h2>
        <hr className="border-t border-[#E5E7EB] mb-6" />
      </>
    ),
    h3: ({ children, ...props }) => (
      <>
        <h3 className="text-2xl font-semibold text-[#111827] mt-8 mb-4 group flex items-center" {...props}>
          {children}
          <a href={`#${props.id}`} onClick={smoothScroll} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            #
          </a>
        </h3>
      </>
    ),
    h4: ({ children, ...props }) => (
      <h4 className="text-xl font-semibold text-[#111827] mt-6 mb-4 group flex items-center" {...props}>
        {children}
        <a href={`#${props.id}`} onClick={smoothScroll} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </a>
      </h4>
    ),
    h5: ({ children, ...props }) => (
      <h5 className="text-lg font-semibold text-[#111827] mt-4 mb-2 group flex items-center" {...props}>
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
    p: ({ children }) => <p className="text-[15px] leading-7 text-[#374151] mb-6">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 mb-6">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
    li: ({ children }) => <li className="text-[15px] leading-7 text-[#374151] mb-1">
      {children}
    </li>,
    a: ({ href, children, ...props }) => {
      const isInHeading = href?.startsWith('#');

      return (
        <a
          href={href}
          className={isInHeading ? `text-[#111827]` : `text-blue-600 underline hover:no-underline`}
          onClick={(e) => isInHeading ? smoothScroll(e) : undefined}
        >
          {children}
        </a>
      )
    },
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={`${className} bg-gray-100 dark:bg-gray-800 rounded-md px-1 py-0.5`} {...props}>
          {children}
        </code>
      )
    },
    table({ children }) {
      return (
        <Table className="border-[#E5E7EB] border border-collapse">{children}</Table>
      )
    },
    thead({ children }) {
      return <TableHeader>{children}</TableHeader>
    },
    tbody({ children }) {
      return <TableBody>{children}</TableBody>
    },
    tr({ children }) {
      return <TableRow>{children}</TableRow>
    },
    th({ children }) {
      return <TableHead className="text-[14px] font-semibold bg-[#F9FAFB] h-[40px] px-4 border-[#E5E7EB] border-r last:border-r-0">
      {children}
    </TableHead>
    },
    td({ children }) {
      return <TableCell className="text-[14px] h-[40px] px-4 border-[#E5E7EB] border-r last:border-r-0">
      {children}
    </TableCell>
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

