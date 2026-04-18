import { Config } from "@/util/config";
import { navCache, getCacheKey } from "@/util/cacheService";
import {
  transformApiResponseToNavSections,
  filterApiNavForMenuAndSlug,
  filterApiNavKeepAllLeaves,
  type ApiNavItem,
  type NavSection,
} from "@/util/navTransform";
import {
  applyNavFolderOverlayToMenulinksTree,
  buildMenulinksUrl,
  buildNavApiUrl,
  extractNavApiFolderOverlay,
  navPayloadToApiNavTree,
  resortMenulinksDerivedTree,
} from "@/util/menulinksToApiNav";
import fallbackNavData from "@/components/navigation/fallback.json";

type FetchOptions = {
  /** Passed as menulinks `folderPath` (default from `Config.NavFolderPath`). */
  path?: string;
  depth?: number;
  languageId?: number;
  ttlSeconds?: number;
  currentSlug?: string;
};

export type NavSectionsBundle = {
  /** Left nav: respects `showOnMenu` + current slug shadow rows. */
  sections: NavSection[];
  /** Full tree for breadcrumbs / quick-search paths (includes `showOnMenu: false` links). */
  sectionsAllForPaths: NavSection[];
};

function loadFallbackNavSections(currentSlug?: string): NavSectionsBundle {
  try {
    const legacy = fallbackNavData as unknown as {
      entity?: { children?: ApiNavItem[] };
      children?: ApiNavItem[];
    };
    const apiChildren = (legacy?.entity?.children ?? legacy?.children ?? []) as ApiNavItem[];
    const sectionsAllForPaths = transformApiResponseToNavSections(
      filterApiNavKeepAllLeaves(apiChildren)
    );
    const sections = transformApiResponseToNavSections(
      filterApiNavForMenuAndSlug(apiChildren, currentSlug)
    );

    if (sections.length > 0) {
      console.warn("⚠️ Using fallback navigation data — primary nav source failed");
      return {
        sections,
        sectionsAllForPaths:
          sectionsAllForPaths.length > 0 ? sectionsAllForPaths : sections,
      };
    }

    console.error("Fallback navigation data is invalid or empty");
    return { sections: [], sectionsAllForPaths: [] };
  } catch (err) {
    console.error("Failed to load fallback navigation data:", err);
    return { sections: [], sectionsAllForPaths: [] };
  }
}

export async function getNavSections(options: FetchOptions = {}): Promise<NavSectionsBundle> {
  const folderPath = options.path ?? Config.NavFolderPath;
  const depth = options.depth ?? Config.NavMenuDepth;
  const ttlSeconds = options.ttlSeconds ?? 900;
  const navOverlayDepth = Config.NavFolderOverlayDepth;
  const languageId = options.languageId ?? Config.LanguageId;

  const pathsCacheKey = getCacheKey(
    `menulinks|${Config.NavSiteId}|${folderPath}|${depth}|nav${navOverlayDepth}|allPaths`
  );
  const slugCacheKey = getCacheKey(
    `menulinks|${Config.NavSiteId}|${folderPath}|${depth}|nav${navOverlayDepth}|${options.currentSlug ?? ""}`
  );

  let sectionsAllForPaths: NavSection[] | undefined =
    ttlSeconds > 0 ? navCache.get<NavSection[]>(pathsCacheKey) : undefined;
  let sections: NavSection[] | undefined =
    ttlSeconds > 0 ? navCache.get<NavSection[]>(slugCacheKey) : undefined;

  if (sections?.length && sectionsAllForPaths?.length) {
    return { sections, sectionsAllForPaths };
  }

  try {
    const menulinksUrl = buildMenulinksUrl(Config.DotCMSHost, Config.NavSiteId, folderPath, depth);
    const navUrl = buildNavApiUrl(Config.DotCMSHost, folderPath, navOverlayDepth, languageId);

    const [mlRes, navRes] = await Promise.all([
      fetch(menulinksUrl, {
        method: "GET",
        headers: Config.Headers,
        next: { revalidate: ttlSeconds },
      }),
      fetch(navUrl, {
        method: "GET",
        headers: Config.Headers,
        next: { revalidate: ttlSeconds },
      }),
    ]);

    if (!mlRes.ok) {
      console.warn(
        `Menulinks API returned ${mlRes.status} ${mlRes.statusText} — falling back to static navigation`,
        menulinksUrl
      );
      return loadFallbackNavSections(options.currentSlug);
    }

    const json: unknown = await mlRes.json();

    const apiTree = navPayloadToApiNavTree(json, folderPath);

    if (navRes.ok) {
      try {
        const navJson: unknown = await navRes.json();
        const overlay = extractNavApiFolderOverlay(navJson, folderPath);
        applyNavFolderOverlayToMenulinksTree(apiTree, overlay);
        resortMenulinksDerivedTree(apiTree);
      } catch (navErr) {
        console.warn("Nav folder overlay failed — using menulinks-only folder order/titles", navErr);
      }
    } else {
      console.warn(
        `Nav API returned ${navRes.status} ${navRes.statusText} — menulinks-only folder order/titles`,
        navUrl
      );
    }

    if (!sectionsAllForPaths?.length) {
      sectionsAllForPaths = transformApiResponseToNavSections(
        filterApiNavKeepAllLeaves(apiTree)
      );
      if (ttlSeconds > 0 && sectionsAllForPaths.length > 0) {
        navCache.set(pathsCacheKey, sectionsAllForPaths, ttlSeconds);
      }
    }

    if (!sections?.length) {
      const apiChildren = filterApiNavForMenuAndSlug(apiTree, options.currentSlug);
      sections = transformApiResponseToNavSections(apiChildren);
      if (ttlSeconds > 0 && sections.length > 0) {
        navCache.set(slugCacheKey, sections, ttlSeconds);
      }
    }

    if (sections?.length && sectionsAllForPaths?.length) {
      return { sections, sectionsAllForPaths };
    }

    console.warn(
      "Navigation data was empty — falling back to static navigation",
      menulinksUrl
    );
    return loadFallbackNavSections(options.currentSlug);
  } catch (err) {
    console.error("Navigation load failed:", err);
    return loadFallbackNavSections(options.currentSlug);
  }
}
