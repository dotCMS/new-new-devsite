"use client";

import Link from 'next/link';
import OnThisPage from '@/components/navigation/OnThisPage';
import React from 'react';
import { DetailHeader } from './video-header';
import Authors from './authors';  
import VideoComponent from "./video-component";
import { Config } from "@/util/config";

/**
 * Extract asset ID from a dotCMS asset path
 */
function extractAssetId(uri) {
    if (!uri) return null;
    const match = uri.match(/\/dA\/([^/]+)/);
    return match ? match[1] : null;
}

/**
 * Check if the body contains a specific element type (like headings)
 */
const checkForType = (json, type) => {
    if (!json) return false;
    
    function traverse(node) {
        // Return true if current node matches the type
        if (node.type && node.type.toLowerCase() === type.toLowerCase()) {
            return true;
        }
        
        // Check child nodes if they exist
        if (node.content && Array.isArray(node.content)) {
            return node.content.some(child => traverse(child));
        }
        
        return false;
    }
  
    return traverse(json);
};

/**
 * Parse control tags from tags array
 * Returns an object with boolean flags for each control option
 */
const parseControlTags = (tags) => {
    const tagSet = new Set((tags || []).map(tag => tag.toLowerCase()));
    return {
        autoplay: tagSet.has('autoplay'),
        muted: tagSet.has('muted'),
        loop: tagSet.has('loop'),
        nocontrols: tagSet.has('nocontrols'),
    };
};

/**
 * Video Player Component - renders the actual video asset
 * Control tags (autoplay, muted, loop, nocontrols) affect video behavior
 */
const VideoPlayer = ({ asset, thumbnail, tags }) => {
    if (!asset?.idPath) return null;

    const isVideo = asset.mime?.startsWith('video/');
    const thumbnailAssetId = thumbnail?.idPath ? extractAssetId(thumbnail.idPath) : null;
    
    // Parse control tags
    const controls = parseControlTags(tags);

    if (isVideo) {
        // Use CDN host for video assets
        const cdnHost = Config.CDNHost || '';
        // Use the idPath and URL-encode the filename portion to handle spaces and special characters
        // The idPath format is /dA/{id}/asset/{filename}?language_id=1
        const encodedIdPath = asset.idPath.split('/').map((part, index) => 
            // Encode the filename part (usually index 4: /dA/id/asset/filename)
            index >= 4 && !part.includes('?') ? encodeURIComponent(part) : 
            part.includes('?') ? encodeURIComponent(part.split('?')[0]) + '?' + part.split('?')[1] : part
        ).join('/');
        const videoSrc = `${cdnHost}${encodedIdPath}`;
        console.debug("videoSrc:", videoSrc)
        const posterSrc = thumbnailAssetId ? `${cdnHost}/dA/${thumbnailAssetId}/thumbnail/70q/1000maxw` : undefined;
        
        return (
            <div className="w-full">
                <video 
                    controls={!controls.nocontrols}
                    autoPlay={controls.autoplay}
                    muted={controls.muted}
                    loop={controls.loop}
                    playsInline
                    className="w-full rounded-lg shadow-lg"
                    poster={posterSrc}
                >
                    <source src={videoSrc} type={asset.mime} />
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }
    
    return null;
};

export default function VideoDetailComponent({ post }) {
    // Handle both Video and DevResource body structures
    const body = post.body?.json || post.body || post.description?.json || post.description;

    // Check if content has headings for the sidebar
    const hasHeadings = body ? checkForType(body, "heading") : false;

    // Check if this is a Video content type with a video asset
    const hasVideoAsset = post.contentType === 'video' && post.asset?.mime?.startsWith('video/');

    return (
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${!hasHeadings ? 'max-w-screen-2xl' : ''}`}>
            {/* Main Content Grid */}
            <div className={`flex flex-col xl:flex-row gap-4 py-4 sm:py-8 ${!hasHeadings ? 'items-center' : ''}`}>
                {/* Main Content */}
                <article className={`${hasHeadings ? 'xl:flex-1 max-w-4xl' : 'w-full max-w-none xl:max-w-none'}`}>
                    <main>
                        <DetailHeader post={post} />
                       
                        {/* Render video player for Video content type */}
                        {hasVideoAsset && (
                            <VideoPlayer asset={post.asset} thumbnail={post.thumbnail} tags={post.tags} />
                        )}
                        
                        {/* Render body content (block editor content) */}
                        {body && (
                            <VideoComponent 
                                body={body} 
                                title={post.title} 
                                type1={post.type1?.[0] || post.contentType} 
                            />
                        )}
                    </main>
                </article>

                {/* Right Sidebar - Only show if there are headings or author info */}
                {(hasHeadings || post.author) && (
                    <div className="w-full xl:w-56 xl:shrink-0">
                        <div className="sticky top-16 xl:block pl-4">
                            {post.author && <Authors authors={post.author} />}
                            {hasHeadings && (
                                <OnThisPage selectors="main h1, main h2, main h3, main h4, .dot-block-editor h1, .dot-block-editor h2, .dot-block-editor h3, .dot-block-editor h4" />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
