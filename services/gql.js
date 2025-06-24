import { Config } from '@/util/config';
import { getCacheKey } from '@/util/cacheService'
import axios from 'axios';


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
 * Fetch content from dotCMS using GraphQL
 *
 * @param {*} query
 * @return {*}
 */
export const getGraphqlResults = async (query) => {
    const queryHash = getCacheKey(query);

    return await axios.get(Config.GraphqlUrl, {
        params: { "qid": queryHash },   
        data: { query } ,                 
        headers: Config.Headers
    })
    .then(function (response) {
        if(response?.data?.data){
            return response.data.data;
        }else if(response?.data){
            return response.data;
        }else{
            console.error('no data in response:', response);
            return { page: null, errors: 'no data in response:' };
        }
        
    })
    .catch(function (error) {

        console.error('Error fetching data:', error);
        return { page: null, errors: error };
    });


};