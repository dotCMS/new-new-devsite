'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import SocialMediaShare from '@/components/shared/socialMediaShare';
import { ImagePlacerholder } from '@/components/shared/dotCardImage';
import { cn } from '@/util/utils';
import { Calendar, Tag as TagIcon } from 'lucide-react';
import {Config} from '@/util/config';

import { format } from "date-fns";
import Link from 'next/link';

export const DevResourceHeader = ({
    devResource,
    myResource,
    showImage = true
}) => {
    const formattedDate = format(new Date(devResource.publishDate), 'MMMM dd, yyyy');
    const pathname = usePathname();
    const [url, setUrl] = useState('');
    const imageUrl = "/dA/" + devResource.identifier + "/70q/1000maxw/" + devResource.inode;
    
    useEffect(() => {
        const urlString = new URL(pathname, `https://${Config.CDNHost}`);
        setUrl(urlString);
    }, [pathname, devResource.hostname]);

    return (
        <header className="mb-8">
            {/* Back Button Column */}
            <div>
                <Link
                    href={`/learning/?type=${devResource.type1}`}
                    prefetch={false}
                    className="transition-colors flex items-center text-muted-foreground hover:text-foreground"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2 my-2" fill="currentColor"><path d="M10.78 19.03a.75.75 0 0 1-1.06 0l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L5.81 11.5h14.44a.75.75 0 0 1 0 1.5H5.81l4.97 4.97a.75.75 0 0 1 0 1.06Z"></path></svg> Back to {myResource.title}
                </Link>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                {devResource.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-2 sm:gap-4 text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={devResource.postingDate}>{formattedDate}</time>
                </div>

            </div>

            {/* Featured Image */}
            {imageUrl && showImage && (
                <figure className="mb-4 sm:mb-8 max-h-[150px] sm:max-h-[200px] overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={devResource.image?.description || devResource.title}
                        width={1000}
                        height={400}
                        className="w-full h-[200px] sm:h-[400px] object-cover rounded-lg shadow-lg"
                    />
                </figure>
            )}

            {/* Tags */}
            {devResource.tags && (
                <div className="mb-4 sm:mb-8">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {devResource.tags.map((tag, index) => (
                            <Link
                                key={index}
                                href={`/learning/?tagFilter=${encodeURIComponent(tag)}&type=${devResource.type1}`}
                                className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full text-xs sm:text-sm transition-colors"
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
                    { 'mb-6': !!devResource.imageCredit },
                    { 'mt-auto':  !!devResource.author }
                )}>
                {url && <SocialMediaShare url={url} />}
            </div>
        </header>
    );
};
