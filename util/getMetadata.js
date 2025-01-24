import { extractCategoriesFromMap } from './extractCategoriesFromMap';
import { getDotcmsImageURL } from './getDotcmsImageURL';

export const DEFAULT_TITLE = 'dotCMS Developer Portal | The Leading Universal CMS';
export const DEFAULT_DESCRIPTION =
    'dotCMS empowers developers  visual content management for apps, pages and sites built using any framework.';
export const DEFAULT_KEYWORDS = ['dotCMS', 'content management', 'customer experience'];

export const DEFAULT_IMAGE = '/dA/141b73a4b3/tn-dotcms-main.jpg?language_id=1';

export const DOTCMS_DEFAULT = 'dotCMS Developer Portal';

export const DOTCMS_URL = 'https://www.dotcms.dev';

const extractDescriptionForPartner = (overview) => {
    const firstParagraph = overview?.content?.find((content) => content.type === 'paragraph');

    const firstParagraphText = firstParagraph?.content?.find((content) => content.type === 'text');

    return firstParagraphText?.text;
};

const getMetadataFromUrlContentMap = (urlContentMap, contentType) => {
    const categories =
        extractCategoriesFromMap(urlContentMap.categories)?.map((category) =>
            category.value.toLowerCase()
        ) ?? [];

    const tags = urlContentMap.tags?.split(',').map((tag) => tag.toLowerCase()) ?? [];

    const title = urlContentMap?.metaTitle || urlContentMap?.title || DEFAULT_TITLE;
    const description =
        urlContentMap?.metaDescription ||
        extractDescriptionForPartner(urlContentMap.overview) ||
        DEFAULT_DESCRIPTION;
    const keywords = [...DEFAULT_KEYWORDS, ...categories, ...tags, contentType.toLowerCase()];

    return {
        title,
        description,
        keywords,
        authors: urlContentMap.author?.map((author) => ({
            name: `${author.firstName} ${author.lastName}`
        })) ?? [{ name: DOTCMS_DEFAULT, url: DOTCMS_URL }],
        creator: DOTCMS_DEFAULT,
        publisher: DOTCMS_DEFAULT,
        openGraph: {
            title: title,
            description: description,
            url: DOTCMS_URL + urlContentMap.urlMap,
            siteName: title ?? DOTCMS_DEFAULT,
            images: [
                {
                    url: getDotcmsImageURL({
                        src: urlContentMap?.image || DEFAULT_IMAGE,
                        width: '800'
                    }),
                    alt: title,
                    width: 800
                }
            ]
        },
        other: {
            'og:type': contentType.toLowerCase() || 'website'
        }
    };
};
const getMetadataFromPage = (page, contentType) => {
    const title = page?.pageTitle || DEFAULT_TITLE;
    const description = page?.metaDescription || DEFAULT_DESCRIPTION;
    const keywords = page?.metaKeywords?.length
        ? [...DEFAULT_KEYWORDS, ...page.metaKeywords, contentType.toLowerCase()]
        : [...DEFAULT_KEYWORDS, contentType.toLowerCase()];

    return {
        title,
        description,
        keywords,
        authors: [{ name: DOTCMS_DEFAULT, url: DOTCMS_URL }],
        creator: DOTCMS_DEFAULT,
        publisher: DOTCMS_DEFAULT,
        openGraph: {
            title: page?.ogTitle || title,
            description: page?.ogDescription || description,
            type: page?.ogType || 'website',
            url: DOTCMS_URL,
            siteName: DOTCMS_DEFAULT,
            images: [
                {
                    url: getDotcmsImageURL({
                        src: page?.ogImage || DEFAULT_IMAGE,
                        width: '800'
                    }),
                    alt: title,
                    width: 800
                }
            ]
        }
    };
};

export const getMetadataFromVideo = (video) => {
    const categories =
        extractCategoriesFromMap(video.categories)?.map((category) =>
            category.value.toLowerCase()
        ) ?? [];
    const title = video?.metaTitle || video?.title || DEFAULT_TITLE;
    const description = video?.metaDescription || DEFAULT_DESCRIPTION;
    const keywords = video?.metaKeywords?.length
        ? [...DEFAULT_KEYWORDS, ...categories, ...video?.metaKeywords, 'video']
        : [...DEFAULT_KEYWORDS, ...categories, 'video'];

    return {
        title,
        description,
        keywords,
        authors: video.author?.map((author) => ({
            name: `${author.firstName} ${author.lastName}`
        })) ?? [{ name: DOTCMS_DEFAULT, url: DOTCMS_URL }],
        creator: DOTCMS_DEFAULT,
        publisher: DOTCMS_DEFAULT,
        openGraph: {
            title: video?.ogTitle || title,
            description: video?.ogDescription || description,
            url: `${DOTCMS_URL}/videos/${video?.identifier}`,
            siteName: DOTCMS_DEFAULT,
            images: [
                {
                    url: getDotcmsImageURL({
                        src: video?.thumbnail || DEFAULT_IMAGE,
                        width: '800'
                    }),
                    alt: title,
                    width: 800
                }
            ]
        },
        other: {
            'og:type': 'video'
        }
    };
};

export const getMetadata = (pageAsset, contentType = '') => {
    return pageAsset.urlContentMap
        ? getMetadataFromUrlContentMap(pageAsset.urlContentMap, contentType)
        : getMetadataFromPage(pageAsset.page, contentType);
};

export const errorMetadata = {
    title: 'Error Page',
    description: 'An error occurred while trying to load the page'
};
