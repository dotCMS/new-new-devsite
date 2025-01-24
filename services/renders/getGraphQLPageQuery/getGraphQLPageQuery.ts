import { ConfigDict } from '@/utils/constants';
import type { TGraphQLPageData, TGetGraphQLPageQuery } from './types';
import { logRequest } from '@/utils/logRequest';

export const getGraphQLPageQuery = async ({
  path,
  language_id,
  mode
}: TGetGraphQLPageQuery): Promise<TGraphQLPageData | null> => {
  const params: string[] = [];

  if (language_id) params.push(`languageId: "${language_id}"`);
  if (mode) params.push(`pageMode: "${mode}"`);

  const paramsString = params.length ? `, ${params.join(', ')}` : '';

  const query = `
    {
        page(url: "${path}" ${paramsString}) {
            title
            identifier
            url
            seodescription
            containers {
                path
                identifier
                maxContentlets
                containerStructures {
                    id
                    structureId
                    containerInode
                    containerId
                    code    
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
            template {
                iDate
                inode
                identifier
                source
                title
                friendlyName
                modDate
                sortOrder
                showOnMenu
                image
                drawed
                drawedBody
            }
            viewAs {
                mode
                visitor {
                  persona {
                    name
                  }
                }
                language {
                  id
                }
            }
        }
    }
    `;

  try {

    const response = await logRequest(() =>
      fetch(`${ConfigDict.DotCMSHost}/api/v1/graphql`, {
        method: 'POST',
        headers: ConfigDict.Headers,
        body: JSON.stringify({ query }),
        cache: 'no-cache'
      }),
      'getGraphQLPageQuery'
    );

    if (!response) {
      console.error('Failed to fetch GraphQL data.');
      return null;
    }

    const responseJson = await response.json();

    if (responseJson.errors) {
      console.error('GraphQL errors:', responseJson.errors);
      return null;
    }

    const { data } = responseJson;

    if (!data || !data.page) {
      console.error('No page data found');
      return null;
    }

    return data as TGraphQLPageData;
  } catch (error) {
    console.error('Error fetching GraphQL data:', error);
    return null;
  }
};
