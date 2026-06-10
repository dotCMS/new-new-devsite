import 'server-only';
import { Config } from './config';

/**
 * Bunny Stream API client — SERVER ONLY.
 *
 * The AccessKey is a library-scoped secret. Never import this into a Client
 * Component; the `server-only` import above fails the build if you do.
 *
 * Docs: https://docs.bunny.net/api-reference/stream
 */

const BASE_URL = 'https://video.bunnycdn.com';

// Video metadata changes rarely; cache for 5 minutes.
const DEFAULT_REVALIDATE_SECONDS = 300;

export interface BunnyChapter {
  title: string;
  start: number; // seconds
  end: number; // seconds
}

interface BunnyVideo {
  guid: string;
  title: string;
  length: number;
  chapters?: { title: string; start: number; end: number }[];
}

/** True when the Bunny API is configured (library + secret key present). */
export const bunnyConfigured = (): boolean =>
  !!Config.BunnyLibraryId && !!Config.BunnyApiKey;

/**
 * Fetch a single video's metadata from the Bunny Stream API.
 * Returns null on any failure so callers can render without chapters.
 */
async function getVideo(videoId: string): Promise<BunnyVideo | null> {
  if (!bunnyConfigured()) return null;

  const url = `${BASE_URL}/library/${Config.BunnyLibraryId}/videos/${videoId}`;
  try {
    const res = await fetch(url, {
      headers: {
        AccessKey: Config.BunnyApiKey,
        accept: 'application/json',
      },
      next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.error(`Bunny API ${res.status} for video ${videoId}`);
      return null;
    }
    return (await res.json()) as BunnyVideo;
  } catch (error) {
    console.error(`Bunny API request failed for video ${videoId}:`, error);
    return null;
  }
}

/**
 * Return a video's chapters (title + start/end seconds), sorted by start.
 * Empty array when the video has none or the API is unavailable.
 */
export async function getVideoChapters(
  videoId: string,
): Promise<BunnyChapter[]> {
  const video = await getVideo(videoId);
  const chapters = video?.chapters ?? [];
  return [...chapters]
    .map((c) => ({ title: c.title, start: c.start, end: c.end }))
    .sort((a, b) => a.start - b.start);
}
