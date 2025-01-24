
import Link from 'next/link'
import MarkdownContent, { RenderMDX } from '../MarkdownContent'
import { extractDateForTables } from '../../util/formatDate'

export default async function ChangeLogContainer( {data, changelogData} ) {

    console.log("data", await changelogData)
    const {changelogs, totalPages} = await changelogData


  if (!changelogs || changelogs.length === 0) return <div>No data</div>

  const parseBodyToLines = (body) => {
    if (body) return body.split('\n')
    return []
  }

  return (
    <>

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
            text ? <MarkdownContent content={item?.releaseNotes}  key={"changelogMarkdown"+i}  /> : null
          )}
        </div>
      
    </>
  )
}
