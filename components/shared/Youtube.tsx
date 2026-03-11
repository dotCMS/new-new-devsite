"use client";

import React from 'react';
import { cn } from '@/util/utils';

/** Shape of attrs or attrs.data — both can carry YouTube URL and dimensions */
interface YoutubeDataShape {
  srcYoutube?: string;
  src?: string;
  width?: number;
  height?: number;
  widthYoutube?: number;
  heightYoutube?: number;
  start?: number;
  title?: string;
  paragraphSpacing?: string;
  contentType?: string;
}

interface YoutubeProps {
  attrs?: YoutubeDataShape & { data?: YoutubeDataShape };
  /** Block editor passes { node }; attrs live on node.attrs */
  node?: { attrs?: YoutubeProps['attrs'] };
}

/**
 * Extracts video ID and start time from YouTube URL and converts it to embed format
 */
const getYoutubeEmbedUrl = (url: string, startTime?: number): string => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Bare video ID (e.g. from dotCMS thumbnail or API)
  if (/^[\w-]{10,12}$/.test(trimmed)) {
    const embedUrl = `https://www.youtube.com/embed/${trimmed}`;
    return startTime ? `${embedUrl}?start=${startTime}` : embedUrl;
  }

  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  let videoId = '';
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  if (!videoId) return trimmed;
  
  // Extract start time from URL if present (time_continue parameter)
  let extractedStartTime = startTime;
  if (!extractedStartTime) {
    const timeMatch = trimmed.match(/[?&]time_continue=(\d+)/);
    if (timeMatch && timeMatch[1]) {
      extractedStartTime = parseInt(timeMatch[1], 10);
    }
  }
  
  // Build embed URL with optional start time
  let embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const params = new URLSearchParams();
  
  if (extractedStartTime) {
    params.append('start', extractedStartTime.toString());
  }
  
  // Add autoplay=0 and other standard parameters
  params.append('rel', '0');
  params.append('modestbranding', '1');
  
  const queryString = params.toString();
  return queryString ? `${embedUrl}?${queryString}` : embedUrl;
};

/**
 * YouTube component that handles both `youtube` type and `Youtube` content type
 * from the dotBlockEditor. Block editor passes { node }; we use node.attrs when attrs is missing.
 */
const YoutubeComponent: React.FC<YoutubeProps> = (props) => {
  const attrs = props.attrs ?? props.node?.attrs;
  if (!attrs) {
    return null;
  }

  // Handle dotContent format (Youtube content type) and dotVideo/Video with YouTube in data
  const data: YoutubeDataShape = attrs.data ?? attrs;
  const youtubeUrl = data.srcYoutube ?? data.src ?? attrs.src;
  const width = data.widthYoutube ?? attrs.width ?? data.width;
  const height = data.heightYoutube ?? attrs.height ?? data.height;
  const startTime = attrs.start ?? data.start;
  const title = data.title ?? attrs.title;
  const spacing = data.paragraphSpacing ?? attrs.paragraphSpacing;

  if (!youtubeUrl) {
    return null;
  }

  const embedUrl = getYoutubeEmbedUrl(youtubeUrl, startTime);
  // Always use 16:9 aspect ratio (YouTube standard)
  const aspectRatio = 56.25; // 9/16 * 100

  // Container classes with spacing (full width for better video display)
  const containerClasses = cn(
    "relative group w-full ",
    spacing === "nospace" ? "my-0" : "my-8"
  );

  // Wrapper classes for responsive behavior
  const wrapperClasses = cn(
    "relative overflow-hidden rounded-lg shadow-lg bg-black",
    "hover:shadow-xl transition-shadow duration-300",
    "border border-gray-200 dark:border-gray-800"
  );

  return (
    <div className={containerClasses}>
      {title && (
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      
      <div className={wrapperClasses}>
        <div 
          className="relative w-full"
          style={{ 
            paddingBottom: `${aspectRatio}%`,
            height: 0 
          }}
        >
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || "YouTube video player"}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default YoutubeComponent;
