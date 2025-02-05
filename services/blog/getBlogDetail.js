import { getGraphqlResults } from "@/services/gql";
import { logRequest } from "@/util/logRequest";

export async function getBlogDetailQuery(urlTitle) {

    const query = `query ContentAPI {
        BlogCollection(
        query: "+blog.urlTitle_dotraw:${urlTitle} +live:true"
        limit: 1
        offset: 0
        sortBy: "blog.postingDate"
        ) {
        title
        postingDate
        imageCredit
        host {
            hostName
        }
            
        urlTitle
    		author{
          firstName 
          lastName
          company
          linkedin
          twitter
          image{
            versionPath
            idPath
            name
            
          }
        }
        categories {
            name
            key
        }
        identifier
        inode
        teaser
        body{
            json
        }
        thumbnailAlt
        tags
        image {
            fileAsset{
            versionPath
            }
            description
        }   
        }
    }
  `
    return logRequest(async () => getGraphqlResults(query),"blogDetail").then(data => data.BlogCollection[0]);
}