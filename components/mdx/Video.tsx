"use client";

import { FC } from 'react';

interface Source {
  src: string;
  type: string;
}

interface VideoProps {
  sources?: Source[];
  src?: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  poster?: string;
  identifier?: string;
}

const Video: FC<VideoProps> = ({
  sources,
  src,
  title,
  width = "100%",
  height = "auto",
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  className = "",
  poster,
  identifier,
}) => {
    console.log("video identifier", identifier);
  const getVideoUrl = (src?: string) => {
    if (identifier) {
      return `${process.env.NEXT_PUBLIC_DOTCMS_HOST}/dA/${identifier}/video/${src}`;
    }
    return src;
  };

  return (
    <video
      width={width}
      height={height}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      className={`rounded-lg ${className}`}
      playsInline
      poster={poster ? `${process.env.NEXT_PUBLIC_DOTCMS_HOST}/dA/${poster}` : undefined}
      title={title}
    >
      {sources?.map((source, index) => (
        <source 
          key={index} 
          src={getVideoUrl(source.src)} 
          type={source.type} 
        />
      ))}
      {src && (
        <source 
          src={getVideoUrl(src)} 
          type={`video/${src.split('.').pop()}`} 
        />
      )}
      Your browser does not support the video tag.
    </video>
  );
};

export default Video; 