import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeft, BookOpenIcon, Calendar } from "lucide-react";

import TagCloud from "@/components/shared/TagCloud";
import { getTagsByLuceneQuery } from "@/services/getTags";
import { devResourceBaseQuery } from "@/services/learning/getDevResources";
import PaginationBar from "../PaginationBar";
import { ErrorPage } from "../error";

type DevResourceListingProps = {
  devResources: any[];
  pagination: any;
  tagFilter: string;
};

export default async function DevResourceListing({
  devResources,
  pagination,
  tagFilter,
}: DevResourceListingProps) {
  if (!devResources || devResources.length === 0) {
    return <ErrorPage error={{ message: "Resource not found", status: 404 }} />;
  }

  // NOTE: Previously this component attempted to render `myResource.icon`, but that value
  // is not guaranteed to exist and was causing a runtime 500 (React element type undefined).
  // If we want dynamic icons per category later, we can map based on `type1`/`type`.
  const HeroIcon = BookOpenIcon;

  const allTags = await getTagsByLuceneQuery(devResourceBaseQuery(""), 30);
  const tagFilterQueryParam = tagFilter?.length
    ? `tagFilter=${encodeURIComponent(tagFilter)}`
    : "";
  const page = pagination?.page ? pagination?.page : 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1">
          <h1 className="text-4xl font-bold mb-0 text-foreground text-center">
            Learning Resources
          </h1>
          <p className="text-muted-foreground mb-8 px-2 text-center">
            Guides, Howtos and code snippets to help you learn how to do all things dotCMS. 
          </p>
          <div className="container mx-auto px-4">
            <Link
              prefetch={false}
              href="/learning"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 w-fit group transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Learning Center</span>
            </Link>
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="feed"
            aria-label="Blog posts"
          >
            {devResources.map((resource: any) => (
              <article
                key={resource.identifier}
                className="w-full rounded-lg border border-border bg-card text-card-foreground shadow-md transition-shadow duration-200 hover:shadow-lg"
              >
                <div className="relative">
                  {resource.image?.modDate ? (
                    <Link
                      href={`/learning/${resource.slug}?tagFilter=${tagFilter}&page=${page}`}
                      prefetch={false}
                      className="block"
                    >
                      <Image
                        src={`/dA/${resource.identifier}/${resource.inode}`}
                        alt={resource.teaser || resource.title}
                        width={1024}
                        height={1024}
                        className="h-48 w-full rounded-t-lg object-cover"
                      />
                    </Link>
                  ) : (
                    <div className="h-48 w-full rounded-t-lg bg-muted" />
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={resource.publishDate}>
                      {format(new Date(resource.publishDate), "MMMM d, yyyy")}
                    </time>
                  </div>

                  <h2 className="mb-3 line-clamp-2 break-words text-xl font-bold">
                    <Link
                      href={`/learning/${resource.slug}?tagFilter=${tagFilter}&page=${page}`}
                      prefetch={false}
                      className="transition-colors hover:text-primary"
                    >
                      {resource.title}
                    </Link>
                  </h2>

                  <p className="mb-4 line-clamp-3 break-words whitespace-normal text-muted-foreground">
                    {resource.teaser}
                  </p>

                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag: string) => (
                        <Link
                          key={`resourceTags-${tag}`}
                          href={`?tagFilter=${encodeURIComponent(tag)}`}
                          prefetch={false}
                          className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/80"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Pagination UI */}
          <div className="m-8">
            <PaginationBar
              pagination={pagination}
              additionalQueryParams={tagFilterQueryParam}
            />
          </div>
        </main>

        {/* Sidebar */}
        <aside className="lg:w-80 shrink-0" aria-label="Tag filters">
          <TagCloud tags={allTags} selectedTag={tagFilter} />
        </aside>
      </div>
    </div>
  );
}
