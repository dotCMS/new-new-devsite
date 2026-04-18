import { Config } from "./config";
import { client } from "./dotcmsClient";
import { navCache, getCacheKey } from "./cacheService";
import {
    applyNavFolderOverlayToMenulinksTree,
    buildMenulinksUrl,
    buildNavApiUrl,
    extractNavApiFolderOverlay,
    navPayloadToApiNavTree,
    resortMenulinksDerivedTree,
} from "./menulinksToApiNav";
import { filterApiNavForMenuAndSlug, filterApiNavKeepAllLeaves } from "./navTransform";

export const fetchPageData = async (params) => {
    try {
        const pageAsset = await client.page.get({
            ...params,
            depth: 1,
        });

        return { pageAsset };
    } catch (error) {
        if (error?.status === 404) {
            return { pageAsset: null, error: null };
        }

        return { pageAsset: null, error };
    }
};

export const fetchNavData = async (dataIn) => {
    const cacheTTL = dataIn.ttl ?? 900;
    const folderPath = dataIn.path || Config.NavFolderPath;
    const depth = dataIn.depth ?? Config.NavMenuDepth;
    const navMenuSlug = dataIn.navMenuSlug ?? dataIn.currentSlug;

    const navOverlayDepth = Config.NavFolderOverlayDepth;
    const languageId = Config.LanguageId ?? 1;
    const rawCacheKey = getCacheKey(
        `menulinks|${Config.NavSiteId}|${folderPath}|${depth}|nav${navOverlayDepth}|tree`
    );

    let tree = navCache.get(rawCacheKey);

    const menulinksUrl = buildMenulinksUrl(Config.DotCMSHost, Config.NavSiteId, folderPath, depth);
    const navUrl = buildNavApiUrl(Config.DotCMSHost, folderPath, navOverlayDepth, languageId);

    try {
        if (!tree) {
            const [mlRes, navRes] = await Promise.all([
                fetch(menulinksUrl, {
                    method: "GET",
                    headers: Config.Headers,
                }),
                fetch(navUrl, {
                    method: "GET",
                    headers: Config.Headers,
                }),
            ]);
            if (!mlRes.ok) {
                console.warn("Menulinks fetch failed:", mlRes.status, menulinksUrl);
                return { nav: null, navAllForPaths: null };
            }
            const json = await mlRes.json();
            tree = navPayloadToApiNavTree(json, folderPath);
            if (navRes.ok) {
                try {
                    const navJson = await navRes.json();
                    const overlay = extractNavApiFolderOverlay(navJson, folderPath);
                    applyNavFolderOverlayToMenulinksTree(tree, overlay);
                    resortMenulinksDerivedTree(tree);
                } catch (navErr) {
                    console.warn("Nav folder overlay failed — using menulinks-only folders", navErr);
                }
            }
            if (tree && tree.length > 0) {
                navCache.set(rawCacheKey, tree, cacheTTL);
            }
        }

        if (!tree || !Array.isArray(tree)) {
            return { nav: null, navAllForPaths: null };
        }

        const filtered = filterApiNavForMenuAndSlug(tree, navMenuSlug);
        const allForPaths = filterApiNavKeepAllLeaves(tree);
        return {
            nav: { children: filtered },
            navAllForPaths: { children: allForPaths },
        };
    } catch (err) {
        console.group("Error fetching menulinks");
        console.warn("Check your URL or DOTCMS_HOST: ", menulinksUrl);
        console.error(err);
        console.groupEnd();

        return { nav: null, navAllForPaths: null };
    }
};
