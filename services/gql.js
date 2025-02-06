import { Config } from '@/util/config';

const GRAPHQL_ENPOINT = `/api/v1/graphql`;

/**
 * Get the GraphQL query for a page
 *
 * @param {*} query
 * @return {*}
 */
export function getGraphQLPageQuery({ path, mode}) {
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
    const url = new URL(GRAPHQL_ENPOINT, Config.DotCMSHost);

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: Config.Headers,
            body: JSON.stringify({ query }),
            cache: "no-cache", // Invalidate cache for Next.js
        });
        const { data } = await res.json();
        return data;
    } catch(err) {
        console.group("Error fetching Page");
        console.warn("Check your URL or DOTCMS_HOST: ", url.toString());
        console.error(err);
        console.groupEnd();

        return { page: null };
    }
};