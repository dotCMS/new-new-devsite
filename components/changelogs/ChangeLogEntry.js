'use client'

import Link from 'next/link'
import MarkdownContent from '../MarkdownContent'
import { extractDateForTables } from '../../util/formatDate'
import { smoothScroll } from '@/util/smoothScroll'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from "react";

export default function ChangeLogEntry({ item }) {
  const releaseNotes = item?.releaseNotes.replace(/{#[a-zA-Z0-9\.\-]+}/g, '') || ""
  const dockerImage = item?.dockerImage
  const [copied, setCopied] = useState(false);

  return (
    <div className="pb-[2em] border-b border-gray-200">
      {item?.minor && (
        <h2
          className="text-3xl font-semibold text-foreground mt-12 pb-2 mb-1 group flex items-center"
          id={"v"+item?.minor}
          key={"h2"+item?.minor}
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

            <div className="flex items-center whitespace-nowrap min-w-0">
              <span className="flex-shrink-0">docker tag : {item?.dockerImage.split(':')[1]}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item?.dockerImage);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="inline-flex items-center ml-1 p-1 hover:bg-gray-100 rounded-md"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <div className="flex items-center whitespace-nowrap min-w-0 gap-2">

            </div>


            </div>

        </div>
      </div>
      <div className="pl-1">
        <MarkdownContent content={releaseNotes} />
      </div>
    </div>
  )
}
