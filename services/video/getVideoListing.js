import { graphqlResults } from "@/services/gql";
import { logRequest } from "@/util/logRequest";


export const VIDEO_LISTING_LUCENE_QUERY = `
    +contenttype:video   
    +(conhost:SYSTEM_HOST  ||  conhost:173aff42881a55a562cec436180999cf || categories:developers) 
    +live:true
`.replace(/\n/g, " ").trim();




export async function getVideoListing({tagFilter, page, pageSize}) {

    //console.log("tagFilter", tagFilter);
    //console.log("page", page);
    //console.log("pageSize", pageSize);
    const finalTagFilter = tagFilter 
    ? `+tags:\\"` 
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
        + `\\"` 
    : "";
    const query = `query ContentAPI {
        VideoCollection(
            query: "${VIDEO_LISTING_LUCENE_QUERY}  ${finalTagFilter}"
            limit: ${pageSize}
            page: ${page}
            sortBy: "video.postingDate desc"
        ) {
            title
            postingDate
            urlTitle
            identifier
            teaser
            tags
            image {
                fileAsset {
                    versionPath
                    name
                    idPath
                }
                description
            }
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
    //console.warn("--------------------------------");
    //console.warn(query);
    //console.warn("--------------------------------");
    const result = await logRequest(async () => graphqlResults(query), 'getVideoListing');
    
    if (result.errors && result.errors.length > 0) {
        console.error('GraphQL errors in getVideoListing:', result.errors);
        throw new Error(result.errors[0].message);
    }

    return {videos: result.data.VideoCollection, pagination: result.data.Pagination[0]};

}
