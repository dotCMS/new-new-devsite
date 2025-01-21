import { extractCategoriesFromMap } from '@/app/utils/extractCategoriesFromMap';

const TAG_COLORS_MAP = {
    500: 'bg-indigo-500',
    600: 'bg-indigo-600',
    700: 'bg-indigo-700',
    800: 'bg-indigo-800'
};

/**
 * Normalize the contentlet to be used in the detail page
 *
 * @param {*} contentlet
 * @return {*}
 */
export const normalizeDetailPageContent = (contentlet) => {
    const { contentType, ...content } = contentlet;

    switch (contentType) {
        case 'News':
            return normalizeNews(content);
        case 'Blog':
            return normalizeBlog(content);
        default:
            console.warn('Content type not supported in the detail page');
            return content;
    }
};

const formateDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

/**
 * Normalize the blog content to be used in the detail page
 *
 * @param {*} {
 *     title,
 *     body,
 *     postingDate,
 *     imageCredit,
 *     categories,
 *     author,
 *     tags,
 *     image,
 * }
 * @return {*}
 */
const normalizeBlog = ({
    title,
    body,
    postingDate,
    imageCredit,
    categories,
    author,
    tags,
    image
}) => {
    return {
        body,
        image,
        title,
        imageCredit,
        tags: buildTags(tags),
        author: author?.[0],
        publishDate: formateDate(postingDate),
        categories: extractCategoriesFromMap(categories)
    };
};

/**
 * Normalize the news content to be used in the detail page
 *
 * @param {*} {
 *     title,
 *     body,
 *     publishDate,
 *     image,
 *     imageCredit = "",
 *     tags = [],
 *     author = [],
 *     categories = [],
 * }
 * @return {*}
 */
const normalizeNews = ({
    title,
    body,
    publishDate,
    image,
    imageCredit = '',
    tags = [],
    author = [],
    categories = []
}) => {
    return {
        body,
        image,
        title,
        imageCredit,
        tags: buildTags(tags),
        categories,
        author: author?.[0],
        publishDate: formateDate(publishDate)
    };
};

/**
 * Build the tags array with the tags string
 *
 * @param {*} tags
 * @return {*}
 */
const buildTags = (tags) => {
    const tagsArray = typeof tags === 'string' ? tags.split(',') : tags;

    if (!tagsArray) {
        return [];
    }

    return tagsArray
        ?.map((tag, i) => ({
            text: tag.trim(),
            fontColor: 'text-white',
            bgColor: TAG_COLORS_MAP[Math.min(i * 100 + 500, 800)] // Gap the value to 800
        }))
        .slice(0, 3);
};
