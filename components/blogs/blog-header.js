'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import SocialMediaShare from '@/components/shared/socialMediaShare';
import { cn } from '@/util/utils';
import { Calendar, Tag as TagIcon } from 'lucide-react';
import { format } from "date-fns";
import Link from 'next/link';

function extractAssetId(uri) {
    const match = uri.match(/\/dA\/([^/]+)/);
    return match ? match[1] : null;
}

export const DetailHeader = ({
    post,
}) => {
    const formattedDate = format(new Date(post.postingDate), 'MMMM dd, yyyy');
    const pathname = usePathname();
    const [url, setUrl] = useState('');
    const imageUrl = post.image?.fileAsset?.versionPath;
    
    useEffect(() => {
        const urlString = new URL(pathname, `https://${post.host.hostname}`);
        setUrl(urlString);
    }, [pathname, post.host.hostname]);

    return (
        <header className="mb-8">
            {/* Back Button Column */}
            <div>
                <Link
                    href="/blog"
                    className="transition-colors flex items-center text-muted-foreground hover:text-foreground"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2 my-2" fill="currentColor"><path d="M10.78 19.03a.75.75 0 0 1-1.06 0l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L5.81 11.5h14.44a.75.75 0 0 1 0 1.5H5.81l4.97 4.97a.75.75 0 0 1 0 1.06Z"></path></svg> Back to Blogs
                </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.postingDate}>{formattedDate}</time>
                </div>
                {post.categories && (
                    <div className="flex flex-wrap gap-2">
                        {post.categories.map((category) => (
                            <span key={category.key} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">
                                {category.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Featured Image */}
            {imageUrl && (
                <figure className="mb-8">
                    <img
                        src={"/dA/" + extractAssetId(imageUrl) + "/70q/1000maxw"}
                        alt={post.image?.description || post.title}
                        width={1000}
                        height={400}
                        className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                    />
                </figure>
            )}

            {/* Tags */}
            {post.tags && (
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                            <Link
                                key={index}
                                href={`/blog?tagFilter=${encodeURIComponent(tag)}`}
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
                    { 'mt-auto': !!post.categories.length || !!post.author }
                )}>
                {url && <SocialMediaShare url={url} />}
            </div>
        </header>
    );
};
