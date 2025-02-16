'use client';

import React from 'react';
import { ImageOff } from 'lucide-react';

function extractAssetId(uri: string) {
    const match = uri.match(/\/dA\/([^/]+)/);
    return match ? match[1] : null;
}

interface BlogImageProps {
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

export default function BlogImage({ post }: BlogImageProps) {
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
            <img
                src={`/dA/${assetId}/70q/1000maxw`}
                alt={post.teaser || post.title}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover rounded-t-lg w-full h-full"
                onError={() => setHasError(true)}
            />
        </div>
    );
}
