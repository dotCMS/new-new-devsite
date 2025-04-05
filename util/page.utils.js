import { client } from "./dotcmsClient";

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

export const fetchNavData = async (data) => {


    try {
        const nav = await client.nav.get(data);

        return { "nav": nav };
    } catch (error) {
        console.log("-----error1sds", error)
        return { nav: null, error };
    }
};
