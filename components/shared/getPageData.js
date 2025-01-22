import { client } from '@/app/utils/client';

export const getPageData = async (requestParams) => {
    try {
        const pageAsset = await client.page.get(requestParams);

        return { pageAsset };
    } catch (error) {
        return { error, pageAsset: {} };
    }
};
