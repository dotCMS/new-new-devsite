

import { initEditor, isInsideEditor, postMessageToEditor } from '@dotcms/client';
import { format } from "date-fns";
import { getGraphqlResults } from "@/lib/gql";
import Link from 'next/link';

const query =`query ContentAPI {
  BlogCollection(
    query: "+live:true +(conhost:SYSTEM_HOST conhost:173aff42881a55a562cec436180999cf)"
    limit: 10
    offset: 0
    sortBy: "blog.postingDate"
  ) {
    title
    postingDate
    urlTitle

    categories {
      name
      key
    }
    identifier
    inode
    teaser

    thumbnailAlt
    tags
    image {
      fileAsset{
        versionPath
      }
      description
    }
  }
}
`



export default async function PageBlog({ pageAsset }) {

    const posts = await getGraphqlResults(query);

    if (!posts || !posts.BlogCollection) {
        return <div>No posts</div>
    }
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold mb-8">{pageAsset.page.title} : Listing</h1>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.BlogCollection.map((post, index) => (
                    <article
                        key={index}
                        className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        <a

                            href={`/blog/${post.urlTitle}`}
                            className="text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                            {post.image && (
                                <div className="relative aspect-video">
                                    <img
                                        src={`${post.image.fileAsset.versionPath}/20q`}
                                        alt={post.title}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="text-sm text-muted-foreground mb-2">
                                    {format(new Date(post.postingDate), 'MMMM d, yyyy')}
                                </div>
                                <h2 className="text-xl font-semibold mb-2 flex-1">
                                    <div
                                        href={`/blog/${post.urlTitle}`}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {post.title}
                                    </div>
                                </h2>
                                <p className="text-muted-foreground line-clamp-2 mb-4">
                                    {post.description}
                                </p>

                                Read more →

                            </div>
                        </a>
                    </article>
                ))}
            </div>
        </div>
    );

}

