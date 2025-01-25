import { ConfigDict } from '@/util/constants';
import { SIZE_PAGE } from './config';
import { logRequest } from '@/util/logRequest';

export const getCurrentRelease = async () => {
  const buildQuery = '+contentType:Dotcmsbuilds +Dotcmsbuilds.download:1 +Dotcmsbuilds.lts:3 +live:true';

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
    }, 'getCurrentRelease'); 

    if (!response?.ok) {
      const errorText = await response?.text();
      throw new Error(`HTTP error! status: ${response?.status}, details: ${errorText}`);
    }

    const responseData = await response.json();

    const totalItems = responseData?.entity?.resultsSize || 0;
    const currentRelease = responseData?.entity?.jsonObjectView?.contentlets || [];
    const totalPages = Math.ceil(totalItems / SIZE_PAGE);

    return { currentRelease, totalPages };
  } catch (error) {
    console.error(`Error fetching DotCMS builds: ${error}`);
    return null;
  }
};
