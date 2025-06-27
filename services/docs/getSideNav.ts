import {dotCache} from '@/util/cacheService'
import { Config } from '@/util/config';
import { logRequest } from '@/util/logRequest';
import { graphqlResults } from '../gql';



const cacheKey = "coreNavLeftCacheKey";
export const getSideNav = async () => {

    const cachedValue = dotCache.get(cacheKey);

    if(cachedValue){
        return cachedValue;
    }

    const query = `
    query Documents {
        DotcmsDocumentationCollection(query: "+DotcmsDocumentation.urlTitle_dotraw:table-of-contents") {
            title
            urlTitle
            modDate
            dotcmsdocumentationchildren {
                title
                urlTitle
                modDate
                dotcmsdocumentationchildren {
                    title
                    urlTitle
                    modDate
                    dotcmsdocumentationchildren {
                        title
                        urlTitle
                        modDate
                        dotcmsdocumentationchildren {
                            title
                            urlTitle
                            modDate
                            dotcmsdocumentationchildren {
                                title
                                urlTitle
                                modDate
                                dotcmsdocumentationchildren {
                                    title
                                    urlTitle
                                    modDate
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    `


    const graphData = await graphqlResults(query);

    console.log("graphData:", graphData);
    if (graphData.errors && graphData.errors.length > 0) {
        throw new Error(graphData.errors[0].message)
    }
    dotCache.set(cacheKey, graphData.data.DotcmsDocumentationCollection);

    return graphData.data.DotcmsDocumentationCollection
}
