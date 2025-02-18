"use client"

import { FileText, Book, Code, File, Link2, Component } from "lucide-react"
import { cn } from "@/util/utils"

interface SearchResultProps {
  title: string
  content: string
  url: string
  score?: number
  contentType?: string
  inode?: string
  modDate?: string
  matches?: any[]
}

/*
    title: result.title || 'Untitled Result',
    matches: result.matches || [],
    content: truncateText(result.matches[0].extractedText, 200),
    inode: result.inode,
    url: result.urlMap || result.slug || result.urlTitle,
    score: parseFloat(result.matches[0].distance),
    contentType: result.contentType || 'documentation',
    modDate: result.modDate,
*/

const getIconForContentType = (contentType: string = "") => {
  switch (contentType.toLowerCase()) {
    case "dotcmsdocumentation":
      return <Book className="h-5 w-5 text-blue-500" />
    case "devresource":
      return <Code className="h-5 w-5 text-green-500" />
    case "component":
      return <Component className="h-5 w-5 text-purple-500" />
    case "blog":
      return <FileText className="h-5 w-5 text-orange-500" />
    default:
      return <File className="h-5 w-5 text-gray-500" />
  }
}


const getLinkForContentType = (contentType: string = "",url: string = "") => {
  switch (contentType.toLowerCase()) {
    case "dotcmsdocumentation":
        return url.startsWith("/docs/") ? url : "/docs/" +     url
    case "devresource":
      return  url.startsWith("/learning/") ? url : "/learning/" + url
    case "component":
      return url
    case "blog":
        return url.startsWith("/blog/") ? url : "/blog/" + url
    default:
      return url
  }
}
export function SearchResult({ title, content, url, score, contentType, inode, modDate,     matches }: SearchResultProps) {
  return (
    <div className="flex gap-4 w-full">
      <div className="flex-shrink-0 mt-1">
        {getIconForContentType(contentType)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <h3 className="font-medium text-base truncate">
            <a 
              href={getLinkForContentType(contentType, url)}
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {title}
            </a>
          </h3>
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-full bg-muted">{contentType}</span>
            {score && (
              <span className="px-2 py-1 rounded-full bg-muted">
                Score: {Math.round((1-score) * 100)}%
              </span>
            )}
            {matches && (
              <span className="px-2 py-1 rounded-full bg-muted">
                {matches.length} {matches.length === 1 ? 'match' : 'matches'}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {content.trim().replace(/^[\s\S]*?(?=\S)/, '')}
        </p>
        <a 
          href={getLinkForContentType(contentType, url)}
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
        >
          <Link2 className="h-3 w-3" />
          {getLinkForContentType(contentType, url)}
        </a>
      </div>
    </div>
  )
} 