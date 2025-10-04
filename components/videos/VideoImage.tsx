'use client';

import React from 'react';
import { ImageOff } from 'lucide-react';
import Image from 'next/image';
function extractAssetId(uri: string) {
    const match = uri.match(/\/dA\/([^/]+)/);
    return match ? match[1] : null;
}

interface VideoImageProps {
    post: {
        image?: {
            fileAsset?: {
                idPath: string;
            };
        };
        teaser?: string;
        title: string;
    };
}

export default function VideoImage({ post }: VideoImageProps) {
    const [hasError, setHasError] = React.useState(false);
    const assetId = post.image?.fileAsset?.idPath ? extractAssetId(post.image.fileAsset.idPath) : null;
    
    if (!assetId || hasError) {
        return (
            <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
                <ImageOff className="w-8 h-8 text-muted-foreground/50" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-48">
            <Image
                src={`/dA/${assetId}/70q/1000maxw`}
                alt={post.teaser || post.title}
                width={1000}
                height={1000}
                className="object-cover rounded-t-lg w-full h-full"
               
            />
        </div>
    );
}
