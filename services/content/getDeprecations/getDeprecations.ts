import { ConfigDict } from '@/utils/constants';
//import { SIZE_PAGE } from './config';
const SIZE_PAGE = 0;
import { logRequest } from '@/utils/logRequest'; 

import type { TDeprecation, TDeprecationCards } from './types';
import { JsonViewer } from '@textea/json-viewer';

const getDeprecations = async (): Promise<TDeprecation[] | null> => {
  const deprecationQuery = '+contentType:Deprecation';

  const query = {
    query: deprecationQuery,
    sort: 'Deprecation.dateDeprecated asc',
    limit: SIZE_PAGE,
    offset: SIZE_PAGE,
  };

  try {
    const response = await logRequest(async () => {
      return await fetch(`${ConfigDict.DotCMSHost}/api/content/_search`, {
        method: 'POST',
        headers: ConfigDict.Headers,
        body: JSON.stringify(query),
      });
    }, 'getDeprecations');

    if (response == null) throw new Error(`Error: Null response.`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }

    const responseData = await response.json();

    //const totalItems = responseData?.entity?.resultsSize || 0;
    const deprecations = responseData?.entity?.jsonObjectView?.contentlets || [];
    //const deprecations = responseData?.entity;

    //const totalPages = Math.ceil(totalItems / SIZE_PAGE);
    //const totalPages = 1;

    return deprecations;
  } catch (error) {
    console.error(`Error fetching DotCMS builds: ${error}`);
    return null;
  }
};

export default getDeprecations;
