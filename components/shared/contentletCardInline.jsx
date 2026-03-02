'use client';

import React from 'react';
import { DotCardImage } from './dotCardImage';
import { trimTextToFirstDot } from '@/app/utils/trimTextToFirstDot';
import Link from 'next/link';
import Contentlet from './contentlet';

function ContentletCardInline({
    contentlet,
    showDate = true,
    showCategory = true,
    className = ''
}) {
    const date = new Date(contentlet.publishDate);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
    });

    const [monthAndDay, year] = formattedDate.split(', ');

    const [month, day] = monthAndDay.split(' ');

    const firstCategory = contentlet.categories?.[0] ?? {};

    const firstCategoryName = Object.keys(firstCategory).reduce((acc, key) => {
        acc.push(firstCategory[key]);
        return acc;
    }, [])[0];

    return (
        <Contentlet contentlet={contentlet}>
            <Link href={contentlet.urlMap}>
                <div className={'flex gap-4 h-full w-full ' + className}>
                    <div className={'relative w-2/3'}>
                        <div className="relative w-full aspect-video">
                            <DotCardImage
                                src={contentlet.image}
                                alt={contentlet?.title || 'Blog image'}
                            />
                        </div>

                        {showDate && (
                            <div className="w-fit-content absolute left-3 top-3 z-10 flex min-h-16 flex-col rounded bg-[#0000004d] px-3 py-2 text-white">
                                <span className="text-center text-4xl font-normal">{day}</span>
                                <span className="text-center text-sm">
                                    {month} {year}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex h-full w-2/3 flex-col gap-3">
                        {showCategory && firstCategoryName && (
                            <p className="text-sm text-fuschia-800">{firstCategoryName}</p>
                        )}
                        <h4 className="text-blue-700">{contentlet.title}</h4>
                        <p className="text-sm text-blue-600">
                            {trimTextToFirstDot(contentlet.teaser)}
                        </p>
                    </div>
                </div>
            </Link>
        </Contentlet>
    );
}

export default ContentletCardInline;
