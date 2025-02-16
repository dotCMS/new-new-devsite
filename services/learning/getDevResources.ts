import { getGraphqlResults } from "@/services/gql";
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
    const finalType = sanitize(type) ? "+devresource.type1:" + sanitize(type) : "";
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
    const data = await logRequest(async () => getGraphqlResults(query), 'getResources');
    //console.log(data);
    return { devResources: data.DevResourceCollection, pagination: data.Pagination[0] };
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
    const data = await logRequest(async () => getGraphqlResults(countDevResources), 'getCountDevResources');
    return {video: data.Pagination[0].totalRecords, 
        guide: data.Pagination[1].totalRecords, 
        howto: data.Pagination[2].totalRecords, 
        kb: data.Pagination[3].totalRecords, 
        example: data.Pagination[4].totalRecords};
}   