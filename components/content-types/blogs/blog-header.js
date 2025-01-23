'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';



import Author from '@/components/shared/author';
import SocialMediaShare from '@/components/shared/socialMediaShare';
import { ImagePlacerholder } from '@/components/shared/dotCardImage';
import TagList from '../../shared/TagList';
import { cn } from '@/util/utils';
import { Calendar } from 'lucide-react';
import Tag from '@/components/shared/tag';
import { format } from "date-fns";
const HeaderImage = ({ image, alt, imageUrl }) => {
    const cssClasses = cn('w-auto rounded-lg aspect-video object-cover');
    return (
        <>
            {image ? (
                <Image
                    src={imageUrl}
                    alt={alt || 'dotCMS Site Image'}
                    width={692}
                    height={390}
                    className={cssClasses}
                />
            ) : (
                <div className={cssClasses}>
                    <ImagePlacerholder placeholderFontSize="5xl" />
                </div>
            )}
        </>
    );
};

const TopicsCovered = ({ categories }) => {
    return (
        <div className="hidden flex-1 flex-col gap-2 md:flex">
            <p className="text-blue-600">Topics Covered:</p>
            <div className="flex flex-wrap gap-2">
                {categories.map(({ key, value }) => (
                    <p
                        key={key}
                        className="rounded-[0.250rem] bg-white px-3 py-1 text-sm text-fuschia-800">
                        {value}
                    </p>
                ))}
            </div>
        </div>
    );
};

export const DetailHeader = ({
    post,

}) => {
    const formattedDate = format(new Date(post.postingDate), 'MMMM dd, yyyy');
    const pathname = usePathname();
    const [url, setUrl] = useState('');
    const imageUrl = post.image?.fileAsset?.versionPath;
    useEffect(() => {
        const urlString = new URL(pathname, window.location.origin);
        setUrl(urlString);
    }, [pathname]);

    return (
        <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.postingDate}>{formattedDate}</time>
                </div>
                {post.categories && (
                    <div className="flex flex-wrap gap-2">
                        {post.categories.map((category) => (
                            <span key={category.key} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
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
                        src={imageUrl}
                        alt={post.teaser || post.title}
                        className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                    />
                    {post.image?.description && (
                        <figcaption className="mt-2 text-sm text-gray-600 text-center">
                            {post.image.description}
                        </figcaption>
                    )}
                </figure>
            )}

            {/* Tags */}
            {post.tags && (
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                            >
                                <Tag className="w-4 h-4" />
                                {tag}
                            </span>
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
                            <p className="flex text-sm text-blue-700">Share this article on:</p>
                            {url && <SocialMediaShare url={url} />}
                        </div>
        </header>

    );
};
