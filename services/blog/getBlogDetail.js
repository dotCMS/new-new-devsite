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
            identifier
            firstName 
            lastName
            company
            title
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
            idPath
            name
            }
            description
        }   
        }
    }
  `;
  return logRequest(async () => getGraphqlResults(query), "blogDetail").then(
    (result) => {
      if (result.errors && result.errors.length > 0) {
        console.error('GraphQL errors in getBlogDetail:', result.errors);
        throw new Error(result.errors[0].message);
      }
      return result.data.BlogCollection[0];
    }
  );
}
