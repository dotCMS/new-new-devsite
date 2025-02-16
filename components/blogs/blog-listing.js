import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import TagCloud from '@/components/shared/TagCloud';
import Image from 'next/image';

import { getTagsByLuceneQuery } from "@/services/getTags";
import { BLOG_LISTING_LUCENE_QUERY } from '@/services/blog/getBlogListing';
import PaginationBar from '../PaginationBar';


function extractAssetId(uri) {
    const match = uri.match(/\/dA\/([^/]+)/);
    return match ? match[1] : null;
}




export default async function BlogListing({ blogs, pagination, tagFilter }) {
    const allTags = await getTagsByLuceneQuery(BLOG_LISTING_LUCENE_QUERY, 30);
    const tagFilterQueryParam = tagFilter && tagFilter.length > 0 ? "tagFilter=" + tagFilter : "";

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-8 text-foreground">dotCMS Developers</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((post) => (
                            <article key={post.identifier} className="bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-border">
                                <div className="relative">
                                    {post.image?.fileAsset?.versionPath ? (
                                        <Link href={`/blog/${post.urlTitle}`} className="block">
                                            <img
                                                src={"/dA/" + extractAssetId(post.image.fileAsset.idPath) + "/70q/1000maxw"}
                                                alt={post.teaser || post.title}
                                                width={70}
                                                height={100}
                                                className="w-full h-48 object-cover rounded-t-lg"
                                            />
                                        </Link>
                                    ) : (
                                        <div className="w-full h-48 bg-muted rounded-t-lg" />
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                        <Calendar className="w-4 h-4" />
                                        <time dateTime={post.postingDate}>
                                            {format(new Date(post.postingDate), 'MMMM d, yyyy')}
                                        </time>
                                    </div>
                                    <h2 className="text-xl font-bold mb-3 line-clamp-2">
                                        <Link href={`/blog/${post.urlTitle}`} className="hover:text-primary transition-colors">
                                            {post.title}
                                        </Link>
                                    </h2>
                                    <p className="text-muted-foreground mb-4 line-clamp-3">{post.teaser}</p>
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {post.tags.map((tag) => (
                                                <Link
                                                    key={"postTags-" + tag}
                                                    href={`?tagFilter=${encodeURIComponent(tag)}`}
                                                    className="text-xs px-3 py-1 bg-muted hover:bg-muted/80 text-muted-foreground rounded-full transition-colors"
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
                        <PaginationBar pagination={pagination} additionalQueryParams={tagFilterQueryParam}/>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:w-80 shrink-0">
                    <TagCloud tags={allTags} selectedTag={tagFilter}/>
                </div>
            </div>
        </div>
    );
}

