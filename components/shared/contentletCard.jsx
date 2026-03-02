'use client';

import React from 'react';
import Link from 'next/link';

import { trimTextToFirstDot } from '@/app/utils/trimTextToFirstDot';
import { DotCardImage } from './dotCardImage';
import { formatShotDate } from '@/app/utils/date.utils';

function ContentletCard({
    contentlet,
    _mode = 'light', // To change the color of the text and the background
    showDate = true,
    showCategory = true,
    _showBackground = false, // To add background on study cases
    _borderPadding = false, // To add padding on study cases
    className = '',
    url
}) {
    const { month, day, year } = formatShotDate(contentlet.publishDate);
    const firstCategory = contentlet.categories?.[0] ?? {};
    const firstCategoryName = Object.keys(firstCategory).reduce((acc, key) => {
        acc.push(firstCategory[key]);
        return acc;
    }, [])[0];

    return (
        <Link href={url ?? contentlet.urlMap}>
            <div className={'flex flex-col gap-4 w-full ' + className}>
                <div className="relative rounded-lg w-full aspect-video">
                    <DotCardImage src={contentlet.image} alt={contentlet?.title || 'Blog image'} />
                    {showDate && (
                        <div className="w-fit-content absolute left-3 top-3 z-10 flex min-h-16 flex-col rounded bg-[#0000004d] px-3 py-2 text-white">
                            <span className="text-center text-4xl font-normal">{day}</span>
                            <span className="text-center text-sm">
                                {month} {year}
                            </span>
                        </div>
                    )}
                </div>
                <div className="h-fit-content flex flex-col gap-3">
                    {showCategory && firstCategoryName && (
                        <p className="text-sm text-fuschia-800">{firstCategoryName}</p>
                    )}
                    <h4 className="text-blue-700">{contentlet.title}</h4>
                    <p className="text-sm text-blue-600">
                        {/* TODO: We should use line-clap */}
                        {trimTextToFirstDot(contentlet.teaser)}
                    </p>
                </div>
            </div>
        </Link>
    );
}

export default ContentletCard;
