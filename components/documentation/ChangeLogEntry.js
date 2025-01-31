'use client'

import Link from 'next/link'
import MarkdownContent from '../MarkdownContent'
import { extractDateForTables } from '../../util/formatDate'

export default function ChangeLogEntry({ item }) {
  const releaseNotes = item?.releaseNotes.replace(/{#[a-zA-Z0-9\.\-]+}/g, '') || ""
  const dockerImage = item?.dockerImage

  return (
    <div className="pb-[2em] border-b border-gray-200">
      {item?.minor && (
        <h2
          className="text-3xl font-semibold text-foreground mt-12 pb-2 mb-1 group flex items-center"
          id={item?.minor}
          key={"h2"+item?.minor}
        >
          {item?.minor}
        </h2>
      )}
      
      <div className="flex justify-between pb-2 pl-1">
        <div className="text-sm text-muted-foreground">
          Available: {extractDateForTables(item?.releasedDate)}
        </div>
        <div className="text-sm text-muted-foreground">
          <Link
            className="text-ceruleanBlue"
            href={
              item?.dockerImage
                ? `https://hub.docker.com/r/dotcms/dotcms/tags?name=${item.dockerImage.split(':')[1]}`
                : 'https://hub.docker.com/r/dotcms/dotcms/tags'
            }
            target="_blank"
            rel="noopener noreferrer"
            key={"link"+item?.dockerImage}
          >
            image: {item?.dockerImage.split('/')[1]}
          </Link>
        </div>
      </div>
      <div className="pl-1">
        <MarkdownContent content={releaseNotes} />
      </div>
    </div>
  )
}
