import { Config } from '@/util/config';
import { getCacheKey } from '@/util/cacheService'
import axios from 'axios';
import { graphCache } from '@/util/cacheService';

/**
 * Get the GraphQL query for a page
 *
 * @param {*} query
 * @return {*}
 */
export function getGraphQLPageQuery({ path, mode }) {
    const params = [];

    if (mode) {
        params.push('pageMode: "EDIT_MODE"');
    }

    const paramsString = params.length ? `, ${params.join(", ")}` : "";

    return `
    {
        page(url: "${path}"${paramsString}, site:"173aff42881a55a562cec436180999cf") {
            _map
            urlContentMap {
                identifier
                modDate
                publishDate
                creationDate
                title
                baseType
                inode
                archived
                _map
                urlMap
                working
                locked
                contentType
                live
            }
            title
            friendlyName
                description
            tags
            canEdit
            canEdit
            canLock
            canRead
            template {
              drawed
            }
            containers {
                path
                identifier
                maxContentlets
                containerStructures {
                    contentTypeVar
                }
                containerContentlets {
                    uuid
                    contentlets {
                        _map
                    }
                }
            }
            layout {
                header
                footer
                body {
                    rows {
                        columns {
                            leftOffset
                            styleClass
                            width
                            left
                            containers {
                                identifier
                                uuid
                            }
                        }
                    }
                }
            }
            vanityUrl {
                action
                forwardTo
                uri
            }
            viewAs {
                visitor {
                  persona {
                    name
                  }
                }
                language {
                  id
                  languageCode
                  countryCode
                  language
                  country
                }
            }
        }
    }
    `;
};


/**
 * This method tries to use a graphql GET for a cached response before it uses a POST
 * If it gets no data in the GET, it falls back to the POST, which should load cache.
 * @param {*} query 
 * @returns 
 */
export const graphqlResults = async (query, cacheTTL = 10) => {

    const cacheKey = getCacheKey(query);
    const cachedData = graphCache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }
    let graphData = {
        data: null,
        errors: []
    };
/*
    // If we are in the server, try the GET method
    if (typeof window === 'undefined') {
        graphData = await get(query);
        if(!graphData?.data){
            console.debug("graphql GET failed, trying POST");
        }
    } 
*/
    if (!graphData?.data
        || Object.keys(graphData?.data).length === 0
        || graphData.errors.length > 0) {
        graphData = await post(query);
        if(!graphData?.data){
            console.debug("graphql failed:", graphData.errors);
        }
    }

    if(graphData?.data && Object.keys(graphData?.data).length > 0){
        graphCache.set(cacheKey, graphData, cacheTTL);
    }


    
    return graphData;

}



const axiosFetch = async (query, method) => {
    const queryHash = getCacheKey(query);
    const graphUrl = Config.GraphqlUrl + "?dotcachekey=" + queryHash + "&qid=" + queryHash + "&dotcachettl=" + 600;
    console.debug("Graphql " + method.toUpperCase() + ", url:" + graphUrl)
    try {
        return await axios({
            url: graphUrl,
            method: method,
            data: { query },
            headers: Config.Headers
        })
            .then(function (response) {
                // GraphQL responses can have both data and errors
                const data = response?.data?.data || response?.data || null;
                const errors = response?.data?.errors || response?.errors || [];
                return { data, errors: (typeof errors === 'String') ? [errors] : errors };
            })
    } catch (error) {

        return {
            data: {},
            errors: [{
                message: error.message || 'Network or request error',
                originalError: error
            }]
        };

    }


}


export const get = async (query) => {
    //console.log("graph GET");
    return axiosFetch(query, "get");
};

export const post = async (query) => {
    //console.log("graph POST");
    return axiosFetch(query, "post");
};


