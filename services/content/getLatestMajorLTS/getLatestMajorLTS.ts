import { ConfigDict } from '@/utils/constants';
import { SIZE_PAGE } from './config';
import type { TLatestMajorLTS } from './types';
import { logRequest } from '@/utils/logRequest'; 

export const getLatestMajorLTS = async (): Promise<TLatestMajorLTS | null> => {
  const buildQuery = '+contentType:Dotcmsbuilds +Dotcmsbuilds.download:1 +Dotcmsbuilds.lts:1';

  const query = {
    query: buildQuery,
    sort: 'Dotcmsbuilds.releasedDate desc',
    limit: SIZE_PAGE,
    offset: 0
  };

  try {
    const response = await logRequest(async () => {
      return await fetch(`${ConfigDict.DotCMSHost}/api/content/_search`, {
        method: 'POST',
        headers: ConfigDict.Headers,
        body: JSON.stringify(query)
      });
    }, 'getLatestMajorLTS');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }

    const responseData = await response.json();

    const totalItems = responseData?.entity?.resultsSize || 0;
    const latestLTS = responseData?.entity?.jsonObjectView?.contentlets || [];
    const totalPages = Math.ceil(totalItems / SIZE_PAGE);

    return { latestLTS, totalPages };
  } catch (error) {
    console.error(`Error fetching DotCMS builds: ${error}`);
    return null;
  }
};
