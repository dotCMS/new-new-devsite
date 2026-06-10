"use client";

import { useEffect, useMemo } from "react";
import { Config } from "@/util/config";
import { usePlayer } from "./PlayerProvider";

/**
 * Embeds a BunnyCDN Stream video for a lesson via the public iframe player.
 *
 * The iframe is mounted on the shared PlayerProvider ref so the sidebar
 * lesson accordion can seek it. The lesson's `chapters` (fetched server-side
 * from the Bunny API) are reported to the provider so the sidebar can render
 * them under the active lesson.
 *
 * Renders nothing when the lesson has no `videoId`.
 */
export default function LessonVideo({ videoId, title, chapters = [] }) {
  const { iframeRef, setChapters } = usePlayer();

  const src = useMemo(() => {
    if (!videoId) return null;
    const params = new URLSearchParams({
      autoplay: "false",
      preload: "true",
      responsive: "true",
      playsinline: "true",
    });
    const lib = encodeURIComponent(Config.BunnyLibraryId);
    const id = encodeURIComponent(videoId);
    return `https://iframe.mediadelivery.net/embed/${lib}/${id}?${params.toString()}`;
  }, [videoId]);

  // Publish this lesson's chapters to the shared provider (for the sidebar),
  // and clear them on unmount / lesson change.
  useEffect(() => {
    setChapters(chapters);
    return () => setChapters([]);
  }, [chapters, setChapters]);

  if (!videoId) return null;

  return (
    // Breakout wrapper: the video grows wider than the text column (up to
    // ~2x), stays centered on the same axis as the text, and shrinks to fit
    // narrow screens.
    <div className="relative left-1/2 mb-8 w-[max(100%,min(90vw_-_18rem,1100px))] -translate-x-1/2">
      <div
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ aspectRatio: "16 / 9" }}
      >
        <iframe
          ref={iframeRef}
          src={src}
          title={title ? `${title} video` : "Lesson video"}
          loading="lazy"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  );
}
