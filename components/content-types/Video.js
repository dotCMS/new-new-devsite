"use client";

/**
 * Video content-type component for the block editor.
 * Receives props as the spread of attrs.data from a dotVideo block (same pattern as marketing site):
 *   <Video {...attrs.data} />
 * Handles: native video (asset/idPath), or YouTube (srcYoutube / src with youtube URL) — delegates to YoutubeComponent.
 */
import { Config } from "@/util/config";
import { extractAssetId } from "@/util/utils";
import YoutubeComponent from "@/components/shared/Youtube";

function parseControlTags(tags) {
  const list = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : [];
  const set = new Set(list.map((t) => String(t).toLowerCase().trim()));
  return {
    autoplay: set.has("autoplay"),
    muted: set.has("muted"),
    loop: set.has("loop"),
    nocontrols: set.has("nocontrols"),
  };
}

function buildVideoSrc(asset) {
  if (!asset?.idPath || !asset?.mime?.startsWith?.("video/")) return null;
  const cdnHost = Config.CDNHost || "";
  const encodedIdPath = asset.idPath
    .split("/")
    .map((part, index) =>
      index >= 4 && !part.includes("?")
        ? encodeURIComponent(part)
        : part.includes("?")
          ? encodeURIComponent(part.split("?")[0]) + "?" + part.split("?")[1]
          : part
    )
    .join("/");
  return `${cdnHost}${encodedIdPath}`;
}

function isYouTubeUrl(url) {
  if (!url || typeof url !== "string") return false;
  return /youtube\.com|youtu\.be/i.test(url);
}

export default function Video(props) {
  const asset = props.asset || props.videoAsset;
  const thumbnail = props.thumbnail;
  const tags = props.tags ?? [];
  const controlsConfig = parseControlTags(tags);

  const youtubeUrl = props.srcYoutube || (isYouTubeUrl(props.src) ? props.src : null);
  if (youtubeUrl) {
    return (
      <div className="my-1">
        <YoutubeComponent node={{ attrs: { ...props, data: props, src: youtubeUrl } }} />
      </div>
    );
  }

  let src = props.src;
  if (!src && asset?.idPath && asset?.mime?.startsWith?.("video/")) {
    src = buildVideoSrc(asset);
  }

  if (!src) {
    return null;
  }

  const mimeType = props.mimeType || asset?.mime || `video/${(src.split(".").pop() || "mp4").split("?")[0]}`;
  const thumbnailAssetId = thumbnail?.idPath ? extractAssetId(thumbnail.idPath) : null;
  const cdnHost = Config.CDNHost || "";
  const posterSrc = thumbnailAssetId ? `${cdnHost}/dA/${thumbnailAssetId}/thumbnail/70q/1000maxw` : undefined;

  return (
    <div className="my-6 w-full">
      <video
        controls={!controlsConfig.nocontrols}
        autoPlay={controlsConfig.autoplay}
        muted={controlsConfig.muted}
        loop={controlsConfig.loop}
        playsInline
        width={props.width}
        height={props.height}
        title={props.title}
        className="w-full rounded-lg shadow-lg border border-gray-200 dark:border-gray-800"
        poster={posterSrc}
      >
        <track default kind="captions" srcLang="en" />
        <source src={src} type={mimeType} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
