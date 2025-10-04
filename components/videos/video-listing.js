import React, { useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, Calendar } from 'lucide-react';
import TagCloud from '@/components/shared/TagCloud';
import { getTagsByLuceneQuery } from "@/services/getTags";
import { VIDEO_LISTING_LUCENE_QUERY } from '@/services/video/getVideoListing';
import PaginationBar from '../PaginationBar';
import VideoImage from './VideoImage';

const VideoCard = ({ post }) => {
    const formattedDate = useMemo(() => 
        format(new Date(post.postingDate), 'MMMM d, yyyy'),
        [post.postingDate]
    );

    return (
        <article 
            className="bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-border h-full flex flex-col"
            aria-labelledby={`video-title-${post.identifier}`}
        >
            <Link 
                href={`/videos/${post.urlTitle}`}
                aria-labelledby={`video-title-${post.identifier}`}
                className="hover:opacity-90 transition-opacity"
            >
                <VideoImage post={post} />
            </Link>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    <time dateTime={post.postingDate}>
                        {formattedDate}
                    </time>
                </div>
                <h2 
                    id={`video-title-${post.identifier}`}
                    className="text-xl font-bold mb-3 line-clamp-2"
                >
                    <Link href={`/videos/${post.urlTitle}`} className="hover:text-primary transition-colors">
                        {post.title}
                    </Link>
                </h2>
                <p className="text-muted-foreground mb-4 line-clamp-3 flex-grow">
                    {post.teaser}
                </p>
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2" aria-label="Tags">
                        {post.tags.map((tag) => (
                            <Link
                                key={`${post.identifier}-${tag}`}
                                href={`?tagFilter=${encodeURIComponent(tag)}`}
                                className="text-xs px-3 py-1 bg-muted hover:bg-muted/80 text-muted-foreground rounded-full transition-colors"
                                aria-label={`Filter by tag: ${tag}`}
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
};

export default async function VideoListing({ videos, pagination, tagFilter }) {
    const allTags = await getTagsByLuceneQuery(VIDEO_LISTING_LUCENE_QUERY, 30);
    const tagFilterQueryParam = tagFilter && tagFilter.length > 0 ? "tagFilter=" + tagFilter : "";

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                <main className="flex-1">
                    <h1 className="text-4xl font-bold mb-0 text-foreground text-center">
                        dotCMS Developer Videos
                    </h1>
                    <p className="text-muted-foreground mb-8 px-2 text-center">Videos for the dotDeveloper.</p>
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
                        aria-label="Video posts"
                    >
                        {videos.map((post) => (
                            <VideoCard key={post.identifier} post={post} />
                        ))}
                    </div>
                    
                    <nav className="m-8" aria-label="Pagination">
                        <PaginationBar 
                            pagination={pagination} 
                            additionalQueryParams={tagFilterQueryParam}
                        />
                    </nav>
                </main>

                <aside className="lg:w-80 shrink-0" aria-label="Tag filters">
                    <TagCloud tags={allTags} selectedTag={tagFilter}/>
                </aside>
            </div>
        </div>
    );
}
