"use client";

import React from 'react';
import { cn } from '@/util/utils';

interface YoutubeProps {
  attrs?: {
    src?: string;
    width?: number;
    height?: number;
    start?: number;
    data?: {
      srcYoutube?: string;
      widthYoutube?: number;
      heightYoutube?: number;
      positionCenter?: string | boolean;
      title?: string;
      paragraphSpacing?: string;
      contentType?: string;
      [key: string]: any;
    };
  };
}

/**
 * Extracts video ID and start time from YouTube URL and converts it to embed format
 */
const getYoutubeEmbedUrl = (url: string, startTime?: number): string => {
  if (!url) return '';
  
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  let videoId = '';
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  
  if (!videoId) return url;
  
  // Extract start time from URL if present (time_continue parameter)
  let extractedStartTime = startTime;
  if (!extractedStartTime) {
    const timeMatch = url.match(/[?&]time_continue=(\d+)/);
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
 * from the dotBlockEditor
 */
const YoutubeComponent: React.FC<YoutubeProps> = ({ attrs }) => {
  if (!attrs) {
    return null;
  }

  // Handle dotContent format (Youtube content type)
  const isDotContent = attrs.data?.srcYoutube || attrs.data?.contentType === 'Youtube';
  const youtubeUrl = isDotContent ? attrs.data?.srcYoutube : attrs.src;
  const width = isDotContent ? attrs.data?.widthYoutube : attrs.width;
  const height = isDotContent ? attrs.data?.heightYoutube : attrs.height;
  const startTime = isDotContent ? undefined : attrs.start; // dotContent handles start time in URL
  const title = isDotContent ? attrs.data?.title : undefined;
  const spacing = isDotContent ? attrs.data?.paragraphSpacing : undefined;

  if (!youtubeUrl) {
    return null;
  }

  const embedUrl = getYoutubeEmbedUrl(youtubeUrl, startTime);
  // Always use 16:9 aspect ratio (YouTube standard)
  const aspectRatio = 56.25; // 9/16 * 100

  // Container classes with spacing (left-aligned)
  const containerClasses = cn(
    "relative group w-[90%]",
    spacing === "nospace" ? "my-0" : "my-6"
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
