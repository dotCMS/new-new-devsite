import {dotCache} from '@/util/cacheService'
import { logRequest } from '@/util/logRequest';
const GRAPHQL_ENPOINT = `/api/v1/graphql`


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

    const url = new URL(GRAPHQL_ENPOINT, process.env.NEXT_PUBLIC_DOTCMS_HOST);

    const res = await logRequest(async () => await fetch(url, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN}`,
            "Content-Type": "application/json",
            "dotcachettl": "0" // Bypasses GraphQL cache
        },
        body: JSON.stringify({ query }),
        cache: "no-cache",
    }), "getSideNav");

    if (!res || !res?.ok) {
        throw new Error('Failed to fetch sideNav')
    }

    const data = await res.json()

    if (data.errors) {
        throw new Error(data.errors[0].message)
    }
    dotCache.set(cacheKey, data.data.DotcmsDocumentationCollection);

    return data.data.DotcmsDocumentationCollection
}
