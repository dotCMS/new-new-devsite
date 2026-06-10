"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { Config } from "@/util/config";

const PLAYERJS_SRC =
  "https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js";

/** Format seconds as M:SS or H:MM:SS. */
function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Embeds a BunnyCDN Stream video for a lesson via the public iframe player.
 *
 * When `chapters` are provided (fetched server-side from the Bunny API), a
 * clickable chapter list is rendered under the video. Clicking a chapter
 * seeks the player to that timestamp using Bunny's player.js API — no secret
 * key needed on the client, only the public library ID + video GUID.
 *
 * Renders nothing when the lesson has no `videoId`.
 */
export default function LessonVideo({ videoId, title, chapters = [] }) {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

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

  // Wire player.js once both the script and the iframe are ready.
  useEffect(() => {
    if (!scriptReady) return;
    const iframe = iframeRef.current;
    if (!iframe || !window.playerjs) return;

    const player = new window.playerjs.Player(iframe);
    playerRef.current = player;

    const handleReady = () => {
      player.on("timeupdate", ({ seconds }) => setCurrentTime(seconds));
    };
    player.on("ready", handleReady);

    return () => {
      try {
        player.off("timeupdate");
        player.off("ready");
      } catch {
        /* noop */
      }
      playerRef.current = null;
    };
  }, [scriptReady, videoId]);

  const seek = useCallback((seconds) => {
    const player = playerRef.current;
    if (!player) return;
    player.setCurrentTime(seconds);
    player.play();
    setCurrentTime(seconds);
  }, []);

  // The chapter currently playing (last chapter whose start <= currentTime).
  const activeChapterStart = useMemo(() => {
    if (!chapters.length) return null;
    let active = null;
    for (const ch of chapters) {
      if (currentTime >= ch.start) active = ch.start;
      else break;
    }
    return active;
  }, [chapters, currentTime]);

  if (!videoId) return null;

  return (
    <>
      <Script
        src={PLAYERJS_SRC}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />

      {/* Breakout wrapper: the video grows wider than the text column (up to
          ~2x), stays centered on the same axis as the text, and shrinks to
          fit narrow screens. The chapter list below stays in the text column. */}
      <div className="relative left-1/2 mb-4 w-[max(100%,min(90vw_-_18rem,1100px))] -translate-x-1/2">
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

      {chapters.length > 0 && (
        // Constrained to (and centered within) the text column.
        <div className="mb-8 rounded-lg border border-border">
          <p className="border-b border-border px-4 py-2.5 text-sm font-semibold">
            Chapters
          </p>
          <ol className="divide-y divide-border">
            {chapters.map((ch, i) => {
              const isActive = ch.start === activeChapterStart;
              return (
                <li key={`${ch.start}-${i}`}>
                  <button
                    type="button"
                    onClick={() => seek(ch.start)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent ${
                      isActive ? "bg-primary/10 font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <span className="flex min-w-0 items-baseline gap-3">
                      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {formatTime(ch.start)}
                      </span>
                      <span className="min-w-0 break-words">{ch.title}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </>
  );
}
