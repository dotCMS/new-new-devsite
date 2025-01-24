import { ConfigDict } from '@/util/constants'
import { SIZE_PAGE } from './config'
import type { TContentlet, TApiResponse } from './types'
import { logRequest } from '@/util/logRequest'

export const getPreviousRelease = async (): Promise<{ previousRelease: TContentlet[]; totalPages: number } | null> => {
  return logRequest(async () => {
    const buildQuery = '+contentType:Dotcmsbuilds +Dotcmsbuilds.released:true';

    const query = {
      query: buildQuery,
      sort: 'Dotcmsbuilds.releasedDate desc',
      limit: SIZE_PAGE,
      offset: 0,
    };

    const response = await fetch(`${ConfigDict.DotCMSHost}/api/content/_search`, {
      method: 'POST',
      headers: ConfigDict.Headers,
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }

    const responseData: TApiResponse = await response.json();

    const totalItems = responseData?.entity?.resultsSize || 0;
    const previousRelease = responseData?.entity?.jsonObjectView?.contentlets || [];
    const totalPages = Math.ceil(totalItems / SIZE_PAGE);

    return { previousRelease, totalPages };
  }, 'getPreviousRelease');
};
