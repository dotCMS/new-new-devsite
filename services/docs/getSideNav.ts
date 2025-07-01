import {navCache} from '@/util/cacheService'
import { graphqlResults } from '../gql';



const cacheKey = "coreNavLeftCacheKey";
export const getSideNav = async () => {

    const cachedValue = navCache.get(cacheKey);

    if(cachedValue){
        return cachedValue;
    }

    const query = `
    query Documents {
        DotcmsDocumentationCollection(query: "+DotcmsDocumentation.urlTitle_dotraw:table-of-contents") {
            title
            navTitle
            urlTitle
            modDate
            dotcmsdocumentationchildren {
                title
                navTitle
                urlTitle
                modDate
                dotcmsdocumentationchildren {
                    title
                    navTitle
                    urlTitle
                    modDate
                    dotcmsdocumentationchildren {
                        title
                        navTitle
                        urlTitle
                        modDate
                        dotcmsdocumentationchildren {
                            title
                            navTitle
                            urlTitle
                            modDate
                            dotcmsdocumentationchildren {
                                title
                                navTitle
                                urlTitle
                                modDate
                                dotcmsdocumentationchildren {
                                    title
                                    navTitle
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

    //console.log("graphData:", graphData);
    if (graphData.errors && graphData.errors.length > 0) {
        throw new Error(graphData.errors[0].message)
    }
    navCache.set(cacheKey, graphData.data.DotcmsDocumentationCollection, 3600);

    return graphData.data.DotcmsDocumentationCollection
}
