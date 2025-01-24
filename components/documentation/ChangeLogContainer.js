"use client"

import Link from 'next/link'
import { RenderMDX } from '../MarkdownContent'
import { extractDateForTables } from '../../util/formatDate'
import { getChangelog } from '@/services/content/getChangelog/getChangelog'







export default async function ChangeLogContainer({ contentlet }) {

    const { changelogs, totalPages } = await getChangelog({ page: 1, sizePage: 10, isLts: false });
    console.log("changelogs2", changelogs);

  if (!Array.isArray(changelogs) || changelogs.length === 0) return <>No data</>

  const parseBodyToLines = (body) => {
    if (body) return body.split('\n')
    return []
  }

  return (
    <>
      {(changelogs || []).map((item, index) => (
        <div key={index} className="pb-[2em]">
          {item?.minor && (
            <h2
              className="nx-font-semibold nx-tracking-tight nx-text-slate-900 dark:nx-text-slate-100 nx-mt-10 nx-border-b nx-pb-1 nx-text-3xl nx-border-neutral-200/70 contrast-more:nx-border-neutral-400 dark:nx-border-primary-100/10 contrast-more:dark:nx-border-neutral-400 group mb-[0.2em] pb-[0.2em]"
              id={item?.minor}
            >
              {item?.minor}
              <Link href={`#${item?.minor}`} id={`${item?.minor}`} className="subheading-anchor" />
            </h2>
          )}
          <span className="flex justify-between">
            <span className="font-bold">Available: {extractDateForTables(item?.publishDate)}</span>
            <span className="font-bold">
              <Link
                className="text-ceruleanBlue"
                href={
                  item?.dockerImage
                    ? `https://hub.docker.com/r/dotcms/dotcms/tags?name=${item.dockerImage.split(':')[1]}`
                    : 'https://hub.docker.com/r/dotcms/dotcms/tags'
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {item?.starter || 0}
              </Link>
            </span>
          </span>
          {parseBodyToLines(item?.releaseNotes).map((text, i) =>
            text ? item?.releaseNotes : null
          )}
        </div>
      ))}
    </>
  )
}
