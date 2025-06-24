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
        // GraphQL responses can have both data and errors
        if (response?.data) {
            const result = {
                data: response.data.data || null,
                errors: response.data.errors || []
            };
            
            // If there are errors, log them
            if (result.errors.length > 0) {
                console.error('GraphQL errors:', result.errors);
            }
            
            return result;
        } else {
            console.error('No data in response:', response);
            return { 
                data: null, 
                errors: [{ message: 'No data in response' }] 
            };
        }
    })
    .catch(function (error) {
        console.error('Error fetching data:', error);
        return { 
            data: null, 
            errors: [{ 
                message: error.message || 'Network or request error',
                originalError: error
            }] 
        };
    });
};