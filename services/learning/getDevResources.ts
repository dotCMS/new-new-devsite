import { graphqlResults } from "@/services/gql";
import { logRequest } from "@/util/logRequest";

const sanitize = (param: string) => {
    return param !== undefined && param !== null && typeof param === "string" ?
        param.replace("\"", "")
            .replace("+", " ")
            .replace("<", " ")
            .replace(">", " ")
            .replace("(", " ")
            .replace(")", " ")
            .replace("*", " ")
            .replace("?", " ")
            .replace("|", " ")
            .replace("\\", " ")
            .replace(":", " ")
            .replace("'", "")
            .replace("`", "").replace(/\n/g, " ")
        : "";
}
export const devResourceBaseQuery = (type: string) => {

    // you are either video or everything else
    const finalType = type === "video" ? "+devresource.type1:video":"-devresource.type1:video"
    return `+contenttype:devresource +(conhost:SYSTEM_HOST  ||  conhost:173aff42881a55a562cec436180999cf ) +live:true ${finalType}`.replace(/\n/g, " ");
}

export async function getDevResources({
    tagFilter="", 
    page=1, 
    limit=50, 
    type="", 
    slug="",
    needBody=false

}) {

    const finalSlug = sanitize(slug) ? "+devresource.slug_dotraw:" + sanitize(slug) : "";
    const finalTagFilter = sanitize(tagFilter) ?  `+tags:\\"` 
    + sanitize(tagFilter)
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

    const baseQuery = devResourceBaseQuery(type);
    const query = `query ContentAPI {
        DevResourceCollection(
            query: "${baseQuery}  ${finalTagFilter}  ${finalSlug}"
            limit: ${limit}
            page: ${page}
            sortBy: "devresource.publishDate desc"
        ) {
            title
            slug
            type1
            identifier
            teaser
            inode
            tags
            ${needBody ? "body {json}" : ""}
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
    //console.log(query);
    const result = await logRequest(async () => graphqlResults(query), 'getResources');
    
    if (result.errors && result.errors.length > 0) {
        console.error('GraphQL errors in getDevResources:', result.errors);
        throw new Error(result.errors[0].message);
    }
    
    //console.log(result.data);
    return { devResources: result.data.DevResourceCollection, pagination: result.data.Pagination[0] };
}




const countDevResources = `query getAllDevResources {
  videos: DevResourceCollection(query: "+live:true +devresource.type1:video ", limit: 1) {
    title
  }
  guides: DevResourceCollection(query: "+live:true +devresource.type1:guide ", limit: 1) {
    title
  }
  howto: DevResourceCollection(query: "+live:true +devresource.type1:howto ", limit: 1) {
    title
  }
  kb: DevResourceCollection(query: "+live:true +devresource.type1:kb ", limit: 1) {
    title
  }
  example: DevResourceCollection(query: "+live:true +devresource.type1:example ", limit: 1) {
    title
  }
  Pagination {
    totalRecords
  }
}`;

export async function getCountDevResources() {
    const result = await logRequest(async () => graphqlResults(countDevResources), 'getCountDevResources');
    
    if (result.errors && result.errors.length > 0) {
        console.error('GraphQL errors in getCountDevResources:', result.errors);
        throw new Error(result.errors[0].message);
    }
    
    return {video: result.data.Pagination[0].totalRecords, 
        guide: result.data.Pagination[1].totalRecords, 
        howto: result.data.Pagination[2].totalRecords, 
        kb: result.data.Pagination[3].totalRecords, 
        example: result.data.Pagination[4].totalRecords};
}   