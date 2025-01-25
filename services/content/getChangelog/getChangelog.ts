import { ConfigDict } from '@/util/constants';
import { SIZE_PAGE } from './config';
import { logRequest } from '@/util/logRequest'; 


export const getChangelog = async ({ page = 1, isLts = false,limit = SIZE_PAGE }) => {
  const offset = limit * (page - 1);

  const ltsQuery = '+contentType:Dotcmsbuilds +Dotcmsbuilds.download:1 +Dotcmsbuilds.lts:1  +live:true';
  const releaseQuery =
    '+contentType:Dotcmsbuilds +Dotcmsbuilds.released:true +Dotcmsbuilds.showInChangeLog:true +live:true';

  const buildQuery = isLts === true ? ltsQuery : releaseQuery;

  const query = {
    query: buildQuery,
    sort: 'Dotcmsbuilds.releasedDate desc',
    limit: limit,
    offset,
  };

  try {
    const response = await logRequest(async () => {
      return await fetch(`${ConfigDict.DotCMSHost}/api/content/_search`, {
        method: 'POST',
        headers: ConfigDict.Headers,
        body: JSON.stringify(query),
      });
    }, 'getChangelog');
    
    if (response == null) throw new Error(`Error: Null response.`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }

    const responseData = await response.json();
    
    const totalItems = responseData?.entity?.resultsSize || 0;
    const changelogs = responseData?.entity?.jsonObjectView?.contentlets || [];
    
    const totalPages = Math.ceil(totalItems / limit);



    return { changelogs, totalPages };
  } catch (error) {
    console.error(`Error fetching DotCMS builds: ${error}`);
    return null;
  }
};


