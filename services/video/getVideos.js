import { graphqlResults } from "@/services/gql";
import { logRequest } from "@/util/logRequest";

export const VIDEO_LISTING_LUCENE_QUERY = `
    +contenttype:video   
    +(conhost:SYSTEM_HOST  ||  conhost:173aff42881a55a562cec436180999cf || categories:developers) 
    +live:true
`.replace(/\n/g, " ").trim();

export const DEVRESOURCE_VIDEO_LUCENE_QUERY = `
    +contenttype:devresource 
    +(conhost:SYSTEM_HOST || conhost:173aff42881a55a562cec436180999cf) 
    +live:true 
    +devresource.type1:video
`.replace(/\n/g, " ").trim();

const sanitizeTagFilter = (tagFilter) => {
    if (!tagFilter) return "";
    return `+tags:\\"` 
        + tagFilter
            .replace("\"", "")
            .replace("+", " ") 
            .replace("<", " ") 
            .replace(">", " ") 
            .replace("(", " ") 
            .replace(")", " ") 
            .replace("*", " ") 
            .replace("?", " ") 
            .replace("|", " ") 
            .replace("\\", " ") 
        + `\\"`;
};

/**
 * Normalize a Video content type item to a common format
 */
const normalizeVideoItem = (video) => ({
    contentType: 'video',
    identifier: video.identifier,
    inode: video.inode,
    title: video.title,
    urlTitle: video.urlTitle,
    slug: video.urlTitle, // use urlTitle as slug for videos
    categories: video.categories,
    tags: video.tags,
    publishDate: video.publishDate,
    // For videos, use thumbnail or asset for the image
    image: video.thumbnail || video.asset || null,
    imagePrimaryLoad: video.imagePrimaryLoad,
    thumbnail: video.thumbnail,
    asset: video.asset,
    author: video.author,
    teaser: video.metaDescription || video.seo,
    description: video.description,
    metaDescription: video.metaDescription,
    seo: video.seo,
});

/**
 * Normalize a DevResource content type item to a common format
 */
const normalizeDevResourceItem = (devResource) => ({
    contentType: 'devresource',
    title: devResource.title,
    urlTitle: devResource.slug, // use slug as urlTitle for devresources
    slug: devResource.slug,
    categories: null,
    tags: devResource.tags,
    publishDate: devResource.publishDate,
    image: devResource.image,
    imagePrimaryLoad: null,
    thumbnail: devResource.image,
    asset: null,
    author: null,
    teaser: devResource.teaser,
    description: devResource.body,
    metaDescription: devResource.teaser,
    seo: null,
    identifier: devResource.identifier,
    inode: devResource.inode,
    type1: devResource.type1,
    altText: devResource.altText,
});

/**
 * Build the GraphQL query for fetching both Video and DevResource content types
 * @param {string} tagFilter - Optional tag filter
 * @param {number} fetchLimit - Number of records to fetch
 * @param {string} slug - Optional slug to filter by specific video
 * @param {boolean} needBody - Whether to include the body field for detail pages
 */
const buildCombinedQuery = (tagFilter, fetchLimit, slug, needBody = false) => {
    const finalTagFilter = sanitizeTagFilter(tagFilter);
    
    const videoSlug = slug ? `+video.urltitle_dotraw:${slug}` : "";
    const devResourceSlug = slug ? `+devresource.slug_dotraw:${slug}` : "";

    return `query CombinedVideoContentAPI {
        VideoCollection(
            query: "${VIDEO_LISTING_LUCENE_QUERY} ${videoSlug} ${finalTagFilter}"
            limit: ${fetchLimit}
            page: 1
            sortBy: "video.publishDate desc"
        ) {
            identifier
            inode
            title
            urlTitle
            categories {
                name
            }
            tags
            publishDate
            imagePrimaryLoad
            asset {
                mime
                title
                idPath
                size
                name
                width
                height
            }
            thumbnail {
                mime
                title
                idPath
                size
                name
                width
                height
            }
            author {
                firstName
                lastName
                image {
                    title
                    idPath
                    width
                    height
                }
            }
            seo
            metaDescription
            description {
                json
            }
        }
        DevResourceCollection(
            query: "${DEVRESOURCE_VIDEO_LUCENE_QUERY} ${devResourceSlug} ${finalTagFilter}"
            limit: ${fetchLimit}
            page: 1
            sortBy: "devresource.publishDate desc"
        ) {
            title
            slug
            type1
            identifier
            teaser
            inode
            tags
            ${needBody ? `body { json }` : ""}
            image {
                modDate
                title
                width
                mime
                idPath
            }
            altText
            publishDate
        }
        Pagination {
            fieldName
            totalPages
            totalRecords
            pageRecords
            hasNextPage
            hasPreviousPage
            pageSize
            page
            offset
        }
    }`;
};

/**
 * Get a single video detail by slug from either Video or DevResource content types
 * @param {string} slug - The video slug/urlTitle to search for
 */
export async function getVideoDetail(slug) {
    return getVideoListing({ page: 1, pageSize: 1, slug, needBody: true });
}

/**
 * Get video listing with optional filtering
 * @param {Object} params - Parameters for the query
 * @param {string} params.tagFilter - Optional tag filter
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.pageSize - Number of items per page (default: 9)
 * @param {string} params.slug - Optional slug to filter by specific video
 * @param {boolean} params.needBody - Whether to include the body field (default: false)
 */
export async function getVideoListing({ tagFilter, page = 1, pageSize = 9, slug = "", needBody = false }) {
    // For slug lookups, we only need 1 result; otherwise fetch more for proper merged pagination
    const fetchLimit = slug ? 1 : 100;
    
    const query = buildCombinedQuery(tagFilter, fetchLimit, slug, needBody);
    
    //console.debug("Combined Video Query:", query);
    
    const result = await logRequest(async () => graphqlResults(query), 'getVideoListing');
    
    if (result.errors && result.errors.length > 0) {
        console.error('GraphQL errors in getVideoListing:', result.errors);
        throw new Error(result.errors[0].message);
    }

    // Normalize and merge both collections
    const videos = (result.data.VideoCollection || []).map(normalizeVideoItem);
    const devResources = (result.data.DevResourceCollection || []).map(normalizeDevResourceItem);
    
    // Merge both arrays
    const allVideos = [...videos, ...devResources];
    
    // Sort by publishDate descending
    allVideos.sort((a, b) => {
        const dateA = new Date(a.publishDate || 0);
        const dateB = new Date(b.publishDate || 0);
        return dateB - dateA;
    });
    
    // Calculate pagination for merged results
    const totalRecords = allVideos.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const offset = (page - 1) * pageSize;
    const paginatedVideos = allVideos.slice(offset, offset + pageSize);
    
    // Build pagination object similar to GraphQL pagination
    const pagination = {
        fieldName: 'CombinedVideoCollection',
        totalPages: totalPages,
        totalRecords: totalRecords,
        pageRecords: paginatedVideos.length,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        pageSize: pageSize,
        page: page,
        offset: offset,
    };

    return { videos: paginatedVideos, pagination };
}
