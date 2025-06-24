import { ServerConfig } from "./server-config";
import { client } from "./dotcmsClient";
import { dotCache, getCacheKey } from "./cacheService";

export interface PageAsset {
    page?: {
        friendlyName?: string;
        title?: string;
        description?: string;
        teaser?: string;
        seoDescription?: string;
        tags?: string[];
        contentType?: string;
        url?: string;
    };
    vanityUrl?: string;
    layout?: {
        header?: boolean;
        footer?: boolean;
    };
    content?: any;
}

export interface PageError {
    status: number;
    message: string;
}

interface FetchPageDataResult {
    pageAsset: PageAsset | null;
    error?: PageError | null;
}

interface NavData {
    [key: string]: any;
}

interface FetchNavDataParams {
    path: string;
    depth: number;
    languageId: number;
    ttl?: number;
}

interface FetchNavDataResult {
    nav: NavData | null;
    error?: PageError | null;
}

export const fetchPageData = async (params: any): Promise<FetchPageDataResult> => {
    try {
        const pageAsset = await client.page.get({
            ...params,
            depth: 1,
        }) as PageAsset;

        return { pageAsset };
    } catch (error: any) {
        if (error?.status === 404) {
            return { pageAsset: null, error: null };
        }

        return { pageAsset: null, error };
    }
};

export const fetchNavData = async (dataIn: FetchNavDataParams): Promise<FetchNavDataResult> => {
    const cacheTTL = dataIn.ttl || 600;
    const cacheKey = getCacheKey(dataIn.path + dataIn.depth + dataIn.languageId);

    const cachedData = dotCache.get(cacheKey);
    if (cachedData) {
        return { nav: cachedData as NavData };
    }

    const url = new URL("/api/v1/nav" + dataIn.path + "?depth=" + dataIn.depth + "&languageId=" + dataIn.languageId, ServerConfig.DotCMSHost);

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: ServerConfig.Headers
        });
        const nav = await res.json();
        dotCache.set(cacheKey, nav.entity, cacheTTL);
        return { nav: nav.entity };
    } catch (err) {
        // Log error in development only
        if (process.env.NODE_ENV === 'development') {
            console.group("Error fetching Nav Data");
            console.warn("Check your URL or DOTCMS_HOST: ", url.toString());
            console.error(err);
            console.groupEnd();
        }

        return { nav: null, error: { message: "Failed to fetch navigation data", status: 500 } };
    }
};
