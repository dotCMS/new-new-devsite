'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import Image from 'next/image';

function extractAssetId(uri: string) {
    const match = uri.match(/\/dA\/([^/]+)/);
    return match ? match[1] : null;
}

interface AssetInfo {
    mime?: string;
    title?: string;
    idPath?: string;
    size?: number;
    name?: string;
    width?: number;
    height?: number;
}

interface VideoImageProps {
    post: {
        thumbnail?: AssetInfo;
        asset?: AssetInfo;
        teaser?: string;
        title: string;
        // Legacy support for old structure
        image?: {
            fileAsset?: {
                idPath: string;
            };
        };
    };
}

export default function VideoImage({ post }: VideoImageProps) {
    const [hasError, setHasError] = useState(false);
    const [videoFrameUrl, setVideoFrameUrl] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Determine which asset to use as thumbnail
    const thumbnail = post.thumbnail;
    const isVideoThumbnail = thumbnail?.mime?.startsWith('video/');
    
    // Extract asset ID for image URLs
    const assetId = thumbnail?.idPath ? extractAssetId(thumbnail.idPath) : null;

    // Extract first frame from video if needed
    useEffect(() => {
        if (isVideoThumbnail && videoRef.current && !videoFrameUrl) {
            const handleLoadedMetadata = () => {
                // Seek to the first frame
                videoRef.current!.currentTime = 0.1;
            };

            const handleSeeked = () => {
                // Capture the frame
                const canvas = document.createElement('canvas');
                canvas.width = videoRef.current!.videoWidth;
                canvas.height = videoRef.current!.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(videoRef.current!, 0, 0);
                    const frameUrl = canvas.toDataURL('image/jpeg');
                    setVideoFrameUrl(frameUrl);
                }
                // Remove event listeners after capture
                videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
                videoRef.current?.removeEventListener('seeked', handleSeeked);
            };

            const video = videoRef.current;
            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            video.addEventListener('seeked', handleSeeked);

            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                video.removeEventListener('seeked', handleSeeked);
            };
        }
    }, [isVideoThumbnail, videoFrameUrl]);

    // Fallback to legacy image structure
    const legacyAssetId = !assetId && post.image?.fileAsset?.idPath 
        ? extractAssetId(post.image.fileAsset.idPath) 
        : null;
    const finalAssetId = assetId || legacyAssetId;

    if (!finalAssetId && !videoFrameUrl) {
        if (hasError || !thumbnail) {
            return (
                <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
                    <ImageOff className="w-8 h-8 text-muted-foreground/50" />
                </div>
            );
        }
    }

    // Show video frame if available
    if (videoFrameUrl) {
        return (
            <div className="relative w-full h-48">
                <img
                    src={videoFrameUrl}
                    alt={post.teaser || post.title}
                    className="object-cover rounded-t-lg w-full h-full"
                />
            </div>
        );
    }

    // Show image thumbnail if it's an image
    if (finalAssetId && !isVideoThumbnail) {
        return (
            <div className="relative w-full h-48">
                <Image
                    src={`/dA/${finalAssetId}/70q/1000maxw`}
                    alt={post.teaser || post.title}
                    width={1000}
                    height={1000}
                    className="object-cover rounded-t-lg w-full h-full"
                    onError={() => setHasError(true)}
                />
            </div>
        );
    }

    // Hidden video element to capture first frame
    if (isVideoThumbnail && finalAssetId && !videoFrameUrl) {
        return (
            <>
                <video
                    ref={videoRef}
                    src={`/dA/${finalAssetId}`}
                    style={{ display: 'none' }}
                    crossOrigin="anonymous"
                />
                <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
                    <ImageOff className="w-8 h-8 text-muted-foreground/50" />
                </div>
            </>
        );
    }

    return (
        <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-muted-foreground/50" />
        </div>
    );
}
