'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import SocialMediaShare from '@/components/shared/socialMediaShare';
import { cn } from '@/util/utils';
import { Calendar, Tag as TagIcon, ArrowLeft, Video, BookOpen } from 'lucide-react';
import { format } from "date-fns";
import Link from 'next/link';
import Image from 'next/image';

function extractAssetId(uri) {
    if (!uri) return null;
    const match = uri.match(/\/dA\/([^/]+)/);
    return match ? match[1] : null;
}

export const DetailHeader = ({
    post,
}) => {
    // Handle both publishDate and postingDate
    const dateValue = post.publishDate || post.postingDate;
    const formattedDate = dateValue ? format(new Date(dateValue), 'MMMM dd, yyyy') : '';
    const pathname = usePathname();
    const [url, setUrl] = useState('');
    const [imageExists, setImageExists] = useState(true);
    
    // Handle different image structures:
    // - Video content type: post.thumbnail?.idPath or post.asset?.idPath
    // - DevResource content type: post.image?.idPath
    // - Legacy structure: post.image?.fileAsset?.versionPath
    const imageIdPath = post.thumbnail?.idPath || 
                        post.image?.idPath || 
                        post.asset?.idPath || 
                        post.image?.fileAsset?.versionPath;
    const imageAssetId = extractAssetId(imageIdPath);
    
    useEffect(() => {
        // Handle cases where host info may not be available
        const hostname = post.host?.hostname || 'dev.dotcms.com';
        const urlString = new URL(pathname, `https://${hostname}`);
        setUrl(urlString);
    }, [pathname, post.host?.hostname]);

    // Check if the image exists (not a 404)
    useEffect(() => {
        if (!imageAssetId) {
            setImageExists(false);
            return;
        }

        const checkImageExists = async () => {
            setImageExists(false);
            return;
            try {
                const response = await fetch(`/dA/${imageAssetId}/thumbnail/70q/1000maxw`, {
                    method: 'HEAD'
                });
                setImageExists(response.ok);
            } catch (error) {
                setImageExists(false);
            }
        };

        checkImageExists();
    }, [imageAssetId]);

    // Get categories - may be null for DevResource content type
    const categories = post.categories || [];

    return (
        <header className="mb-8">
            {/* Back Button Column */}
            <div>
                <Link
                    href="/videos"
                    className="transition-colors flex items-center text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Videos
                </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 mt-4">
                {post.title}
            </h1>

            {/* Teaser/Description */}
            {post.teaser && (
                <p className="text-lg text-muted-foreground mb-6">
                    {post.teaser}
                </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                {/* Content Type Chip */}
                {post.contentType === 'video' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                        <Video className="w-4 h-4" />
                        Video
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        <BookOpen className="w-4 h-4" />
                        DevResource
                    </span>
                )}
                {formattedDate && (
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={dateValue}>{formattedDate}</time>
                    </div>
                )}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <span key={category.key || category.name} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">
                                {category.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Featured Image - only show if image exists (not 404) */}
            {imageAssetId && imageExists && (
                <figure className="mb-4 sm:mb-8 max-h-[100px] sm:max-h-[200px] opacity-50 overflow-hidden">
                    <Image
                        src={`/dA/${imageAssetId}/thumbnail/70q/1000maxw`}
                        alt={post.image?.description || post.altText || post.title}
                        width={1000}
                        height={400}
                        className="w-full h-[200px] sm:h-[400px]  object-cover rounded-lg shadow-lg"
                    />
                </figure>
            )}

            {/* Tags - filter out video control tags (autoplay, muted, nocontrols, loop) */}
            {post.tags && post.tags.length > 0 && (
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                        {post.tags
                            .filter(tag => !['autoplay', 'muted', 'nocontrols', 'loop'].includes(tag.toLowerCase()))
                            .map((tag, index) => (
                            <Link
                                key={index}
                                href={`/videos?tagFilter=${encodeURIComponent(tag)}`}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full text-sm transition-colors"
                            >
                                <TagIcon className="w-4 h-4" />
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div
                className={cn(
                    'flex justify-between items-center',
                    { 'mb-6': !!post.imageCredit },
                    { 'mt-auto': categories.length > 0 || !!post.author }
                )}>
                {url && <SocialMediaShare url={url} />}
            </div>
        </header>
    );
};
