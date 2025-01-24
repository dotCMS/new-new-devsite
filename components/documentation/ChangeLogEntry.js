
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
    <div className="container flex min-h-screen p-0">
      {/* Left Navigation */}
      <div className="w-72 shrink-0">
        <nav 
          ref={navRef}
          className="h-[calc(100vh-4rem)] overflow-y-auto sticky top-16 p-4 pt-8 px-2
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
        >
          <NavTree 
            items={sideNav[0]?.dotcmsdocumentationchildren || []} 
            currentPath={myPath}
          />
        </nav>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 min-w-0"> 
        <div className="max-w-[1400px] mx-auto flex">
          {/* Main Content Area */}
          <main className="flex-1 min-w-0 pt-8 px-12
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20">
            <Breadcrumbs 
              items={sideNav[0]?.dotcmsdocumentationchildren || []} 
              currentPath={myPath}
            />
            
            <div className="markdown-content">
              <h1 className="text-4xl font-bold mb-6">{contentlet.title}</h1>
              <MarkdownContent content={documentation} />
            </div>
          </main>

          {/* Right Sidebar - On This Page */}
          <div className="w-64 shrink-0 hidden xl:block">
            <div className="sticky top-16 pt-8 pl-8">
              <OnThisPage />
            </div>
          </div>
        </div>
      </div>
    </div>


      {changelogs.map((item, index) => (
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
            text ? <MarkdownContent content={item?.releaseNotes} /> : null
          )}
        </div>
      ))}
    </>
  )
}
