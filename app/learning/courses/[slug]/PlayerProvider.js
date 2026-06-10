"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Script from "next/script";

const PLAYERJS_SRC =
  "https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js";

/**
 * Shares a single Bunny player.js instance across the course layout so the
 * video (rendered in the page content) and the sidebar lesson accordion can
 * talk to the same player — clicking a chapter in the sidebar seeks the
 * video, and the player's playback time drives which chapter is highlighted.
 *
 * The video component mounts the iframe via `iframeRef` and reports the
 * current lesson's chapters via `setChapters`. The sidebar reads `chapters`,
 * `currentTime`, and calls `seek`.
 */
const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [chapters, setChapters] = useState([]);

  // Wire player.js once the script and an iframe are both available. Re-runs
  // when chapters change because that signals a new lesson/iframe mounted.
  useEffect(() => {
    if (!scriptReady) return;
    const iframe = iframeRef.current;
    if (!iframe || !window.playerjs) return;

    const player = new window.playerjs.Player(iframe);
    playerRef.current = player;
    setCurrentTime(0);

    player.on("ready", () => {
      player.on("timeupdate", ({ seconds }) => setCurrentTime(seconds));
    });

    return () => {
      try {
        player.off("timeupdate");
        player.off("ready");
      } catch {
        /* noop */
      }
      playerRef.current = null;
    };
  }, [scriptReady, chapters]);

  const seek = useCallback((seconds) => {
    const player = playerRef.current;
    if (!player) return;
    player.setCurrentTime(seconds);
    player.play();
    setCurrentTime(seconds);
  }, []);

  const value = {
    iframeRef,
    chapters,
    setChapters,
    currentTime,
    seek,
  };

  return (
    <PlayerContext.Provider value={value}>
      <Script
        src={PLAYERJS_SRC}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used inside <PlayerProvider>");
  }
  return ctx;
}

/** Index of the actively-playing chapter for a chapter list, or -1. */
export function activeChapterIndex(chapters, currentTime) {
  let active = -1;
  for (let i = 0; i < chapters.length; i++) {
    if (currentTime >= chapters[i].start) active = i;
    else break;
  }
  return active;
}
