import { graphqlResults } from "@/services/gql";
import { logRequest } from "@/util/logRequest";


export const BLOG_LISTING_LUCENE_QUERY = `
    +contenttype:blog   
    +(conhost:SYSTEM_HOST  ||  conhost:173aff42881a55a562cec436180999cf || categories:developers) 
    +live:true
`.replace(/\n/g, " ").trim();




export async function getBlogListing({tagFilter, page, pageSize}) {
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
        BlogCollection(
            query: "${BLOG_LISTING_LUCENE_QUERY}  ${finalTagFilter}"
            limit: ${pageSize}
            page: ${page}
            sortBy: "blog.postingDate desc"
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
    const result = await logRequest(async () => graphqlResults(query), 'getBlogListing');
    
    if (result.errors && result.errors.length > 0) {
        console.error('GraphQL errors in getBlogListing:', result.errors);
        throw new Error(result.errors[0].message);
    }

    return {blogs: result.data.BlogCollection, pagination: result.data.Pagination[0]};

}