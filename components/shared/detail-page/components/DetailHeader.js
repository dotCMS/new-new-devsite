'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/app/utils/cn';

import Author from '@/components/shared/author';
import SocialMediaShare from '@/components/shared/socialMediaShare';
import { ImagePlacerholder } from '@/components/shared/dotCardImage';
import TagList from '../../TagList';

const HeaderImage = ({ image, alt }) => {
    const cssClasses = cn('w-auto rounded-lg aspect-video object-cover');
    return (
        <>
            {image ? (
                <Image
                    src={image}
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
    publishDate,
    tags = [],
    image,
    title,
    imageCredit,
    categories,
    author
}) => {
    const pathname = usePathname();
    const [url, setUrl] = useState('');

    useEffect(() => {
        const urlString = new URL(pathname, window.location.origin);
        setUrl(urlString);
    }, [pathname]);

    return (
        <div className="p-4 pt-8 lg:p-16 lg:px-32">
            <div className="container flex flex-col gap-6 p-0 lg:gap-9">
                <div className="flex flex-col gap-6 lg:w-2/3 ">
                    {!!tags.length && <TagList tags={tags} />}
                    <h1>{title}</h1>
                </div>
                <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex flex-col gap-2 lg:w-2/3">
                        <HeaderImage image={image} alt={title} />
                        {imageCredit && (
                            <p className="text-sm text-blue-600">Image Credit: {imageCredit}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-6 lg:w-1/3 lg:gap-8">
                        <div className="flex flex-col gap-4 lg:gap-8">
                            <time className="text-sm text-blue-600">{publishDate}</time>
                            {!!author && <Author author={author} />}
                        </div>
                        {!!categories.length && <TopicsCovered categories={categories} />}
                        <div
                            className={cn(
                                'flex justify-between items-center',
                                { 'mb-6': !!imageCredit },
                                { 'mt-auto': !!categories.length || !!author }
                            )}>
                            <p className="flex text-sm text-blue-700">Share this article on:</p>
                            {url && <SocialMediaShare url={url} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
