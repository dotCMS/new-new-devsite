'use client';

import React from 'react';
import Image from 'next/image';
import { trimTextToFirstDot } from '@/app/utils/trimTextToFirstDot';
import Link from 'next/link';

function BlockEditorContentlet({ contentType, url, image, title, description }) {
    return (
        <Link href={url} target="_blank" rel="noopener noreferrer" className="not-prose">
            <div className={'my-6 flex gap-4 border-y-2 border-fuschia-700 py-5'}>
                <div className={'relative aspect-video h-full w-2/3'}>
                    <Image
                        src={image || '4f4f0494-833a-429f-acae-96be43c7b489'}
                        className="not-prose rounded-lg object-cover"
                        alt={title}
                        fill={true}
                    />
                </div>
                <div className="flex h-full w-2/3 flex-col gap-3">
                    <p className="text-sm text-fuschia-800">{contentType}</p>
                    <h4 className="text-blue-700">{title}</h4>
                    <p className="line-clamp-3 text-ellipsis text-sm text-blue-600">
                        {trimTextToFirstDot(description)}
                    </p>
                </div>
            </div>
        </Link>
    );
}

export default BlockEditorContentlet;
