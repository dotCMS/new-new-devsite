import { Config } from "@/util/config";

/**
 * Embeds a BunnyCDN Stream video for a lesson via the public iframe player.
 *
 * Only the library ID (public) and the video GUID are needed — no secret
 * API key, since we're just embedding, not calling the Bunny management API.
 *
 * Renders nothing when the lesson has no `bunnyVideoId`.
 */
export default function LessonVideo({ videoId, title }) {
  if (!videoId) return null;

  const params = new URLSearchParams({
    autoplay: "false",
    preload: "true",
    responsive: "true",
    playsinline: "true",
  });
  const src = `https://iframe.mediadelivery.net/embed/${Config.BunnyLibraryId}/${videoId}?${params.toString()}`;

  return (
    // Breakout wrapper: the video grows wider than the text column (up to
    // ~2x), stays centered on the same axis as the text, and shrinks to fit
    // narrow screens. The text under it remains within the parent's column.
    <div className="relative left-1/2 mb-8 w-[min(90vw_-_18rem,1100px)] -translate-x-1/2">
      <div
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ aspectRatio: "16 / 9" }}
      >
        <iframe
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
