import { ConfigDict } from '@/util/constants';
import { SIZE } from './config';
import { logRequest } from '@/util/logRequest';

import type { TGetRecent } from './types';

export const getRecent = async (): Promise<TGetRecent | null> => {
  try {
    const buildQuery = '+contentType:DotcmsDocumentation +live:true';

    const query = {
      query: buildQuery,
      sort: 'modDate Desc',
      limit: SIZE,
      offset: 0,
    };

    const response = await logRequest(async () => {
      return await fetch(`${ConfigDict.DotCMSHost}/api/content/_search`, {
        method: 'POST',
        headers: ConfigDict.Headers,
        body: JSON.stringify(query),
      });
    }, 'getRecent');

    if (!response?.ok) {
      const errorText = await response?.text();
      throw new Error(`HTTP error! status: ${response?.status}, details: ${errorText}`);
    }

    const responseData = await response.json();

    return responseData?.entity.jsonObjectView.contentlets as TGetRecent | null;
  } catch (error) {
    console.error(`Error fetching DotCMS builds: ${error}`);
    return null;
  }
};
