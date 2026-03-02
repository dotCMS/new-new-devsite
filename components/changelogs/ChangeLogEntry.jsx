'use client'

import Link from 'next/link'
import MarkdownContent from '../MarkdownContent'
import { extractDateForTables } from '../../util/formatDate'
import { smoothScroll } from '@/util/smoothScroll'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from "react";
import { isMarkdown, isMarkdownStrict } from '@/util/isMarkdown'
import DangerousHtmlComponent from '../DangerousHtmlComponent'

const HEADER_HEIGHT = 80;

export default function ChangeLogEntry({ item, index }) {

  // Replace Velocity template variables with actual values
  const processReleaseNotes = (notes, version) => {
    if (!notes) return notes;
    
    // Replace $!{version} with the actual version number
    return notes.replace(/\$!?\{version\}/g, version || '');
  };

  const releaseNotes = processReleaseNotes(item?.releaseNotes, item?.minor);
  const useMarkdown = isMarkdownStrict(releaseNotes, 1)

  const [copied, setCopied] = useState(false);

  return (
    <div className="pb-[2em] border-b border-gray-200">
      {item?.minor && (
        <h2
          className="text-3xl font-semibold text-foreground mt-12 pb-2 mb-1 group flex items-center"
          id={"v"+item?.minor}
          key={"h2"+item?.minor}
          style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
        >
          {item?.minor} 
          <a href={"#v"+item?.minor} onClick={smoothScroll}  className="ml-2 opacity-0 group-hover:opacity-90 transition-opacity">
            #
          </a>
        </h2>
      )}
      
      <div className="flex justify-between pb-2 pl-1">
        <div className="text-sm text-muted-foreground">
          Available: {extractDateForTables(item?.releasedDate)}
        </div>
        <div className="text-sm text-muted-foreground">
          {item?.dockerImage ? (
            <div className="flex items-center whitespace-nowrap min-w-0">
              <span className="flex-shrink-0">docker tag : {item.dockerImage.split(':')[1]}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.dockerImage);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="inline-flex items-center ml-1 p-1 hover:bg-gray-100 rounded-md"
                title="Copy docker image"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center whitespace-nowrap min-w-0">
              <span className="flex-shrink-0 text-muted-foreground/60">docker tag : N/A</span>
            </div>
          )}
        </div>
      </div>

      <div className="pl-1">
        {useMarkdown ? <MarkdownContent content={releaseNotes} /> : <DangerousHtmlComponent content={releaseNotes}/>}
      </div>
    </div>
  )
}
