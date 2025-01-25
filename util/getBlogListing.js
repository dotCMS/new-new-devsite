import { getGraphqlResults } from "@/util/gql";
import { logRequest } from "@/util/logRequest";


export const BLOG_LISTING_LUCENE_QUERY = `
    +contenttype:blog   
    +(conhost:SYSTEM_HOST  ||  conhost:173aff42881a55a562cec436180999cf || categories:developers) 
    +live:true
`.replace(/\n/g, " ").trim();




export async function getBlogListing({tagFilter, page, pageSize}) {

    
    const finalTagFilter = tagFilter 
    ? `+tags:\\\"` 
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
        + `\\\"` 
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

    console.log("query", query);

    const data = await logRequest(async () => getGraphqlResults(query), 'getBlogListing');
    console.log("data", data);
    return {blogs: data.BlogCollection, pagination: data.Pagination[0]};

}