import { Config } from "./config";
import { client } from "./dotcmsClient";
import { dotCache, getCacheKey } from "./cacheService";
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
    const cacheTTL = dataIn.ttl || 600;
    const cacheKey = getCacheKey(dataIn.path + dataIn.depth + dataIn.languageId);

    const cachedData = dotCache.get(cacheKey);
    if (cachedData) {
        return { nav: cachedData };
    }

    const url = new URL("/api/v1/nav" + dataIn.path + "?depth=" + dataIn.depth + "&languageId=" + dataIn.languageId, Config.DotCMSHost);

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: Config.Headers

        });
        const  nav  = await res.json();
        dotCache.set(cacheKey, nav.entity, cacheTTL);
        return { nav: nav.entity};
    } catch(err) {
        console.group("Error fetching Page");
        console.warn("Check your URL or DOTCMS_HOST: ", url.toString());
        console.error(err);
        console.groupEnd();

        return { page: null };
    }



    console.log("-----data:", data)
    try {
        const nav = await client.nav.get(data);

        return { "nav": nav };
    } catch (error) {
        console.log("-----error1sds", error)
        return { nav: null, error };
    }
};
