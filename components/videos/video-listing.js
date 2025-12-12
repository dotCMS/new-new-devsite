import React, { useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Video, BookOpen } from 'lucide-react';
import TagCloud from '@/components/shared/TagCloud';
import { getTagsByLuceneQuery } from "@/services/getTags";
import { VIDEO_LISTING_LUCENE_QUERY, DEVRESOURCE_VIDEO_LUCENE_QUERY } from '@/services/video/getVideos';
import PaginationBar from '../PaginationBar';
import VideoImage from './VideoImage';

const VideoCard = ({ post }) => {
    const formattedDate = useMemo(() => 
        format(new Date(post.publishDate), 'MMMM d, yyyy'),
        [post.publishDate]
    );

    // Prepare thumbnail data, handling both image and video thumbnails
    const videoData = {
        ...post,
        teaser: post.teaser || post.title,
    };

    // Route all video content (both Video and DevResource types) to the unified video detail page
    const videoLink = `/videos/${post.slug || post.urlTitle}`;

    return (
        <article 
            className="bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-border h-full flex flex-col"
            aria-labelledby={`video-title-${post.identifier}`}
        >
            <Link 
                href={videoLink}
                aria-labelledby={`video-title-${post.identifier}`}
                className="hover:opacity-90 transition-opacity"
            >
                <VideoImage post={videoData} />
            </Link>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    {/* Content Type Chip */}
                    {post.contentType === 'video' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                            <Video className="w-3 h-3" />
                            Video
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                            <BookOpen className="w-3 h-3" />
                            DevResource
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" aria-hidden="true" />
                        <time dateTime={post.publishDate}>
                            {formattedDate}
                        </time>
                    </span>
                </div>
                <h2 
                    id={`video-title-${post.identifier}`}
                    className="text-xl font-bold mb-3 line-clamp-2"
                >
                    <Link href={videoLink} className="hover:text-primary transition-colors">
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

/**
 * Merge and deduplicate tag buckets from multiple sources
 * Combines doc_count for duplicate tags
 */
const mergeTagBuckets = (tagBuckets1, tagBuckets2) => {
    const tagMap = new Map();
    
    // Add tags from first source
    for (const tag of tagBuckets1) {
        tagMap.set(tag.key, { key: tag.key, doc_count: tag.doc_count });
    }
    
    // Merge tags from second source
    for (const tag of tagBuckets2) {
        if (tagMap.has(tag.key)) {
            // Add doc_count if tag exists
            tagMap.get(tag.key).doc_count += tag.doc_count;
        } else {
            tagMap.set(tag.key, { key: tag.key, doc_count: tag.doc_count });
        }
    }
    
    // Convert back to array and sort by doc_count descending
    return Array.from(tagMap.values())
        .sort((a, b) => b.doc_count - a.doc_count);
};

export default async function VideoListing({ videos, pagination, tagFilter }) {
    // Fetch tags from both Video and DevResource content types
    const [videoTags, devResourceTags] = await Promise.all([
        getTagsByLuceneQuery(VIDEO_LISTING_LUCENE_QUERY, 30),
        getTagsByLuceneQuery(DEVRESOURCE_VIDEO_LUCENE_QUERY, 30)
    ]);
    
    // Merge tags from both sources
    const allTags = mergeTagBuckets(videoTags, devResourceTags);
    const tagFilterQueryParam = tagFilter && tagFilter.length > 0 ? "tagFilter=" + tagFilter : "";

    // Filter out specific tags that should not be displayed
    // allTags is an array of bucket objects with { key: string, doc_count: number }
    const hiddenTags = ['autoplay', 'loop', 'muted', 'nocontrols'];
    const filteredTags = allTags.filter(tag => !hiddenTags.includes(tag.key.toLowerCase()));

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
                    <TagCloud tags={filteredTags} selectedTag={tagFilter}/>
                </aside>
            </div>
        </div>
    );
}
