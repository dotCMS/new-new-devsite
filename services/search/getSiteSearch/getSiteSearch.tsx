import { Config } from '@/util/config';
import type { TSiteSearh, TSearchResult } from './types';
import { logRequest } from '@/util/logRequest'; 

export const getSiteSearch = async ({
  searchTerm,
  searchPlace = '',
  isAllSourcesSearch = false,
  currentPage = 0
}: TSiteSearh) => {
  try {
    const requestBody = {
      q: isAllSourcesSearch ? `+uri:/${searchPlace}/* ${searchTerm}` : searchTerm,
      p: currentPage - 1 || 0
    };

    await logRequest(async () => {
      const response = await fetch(`${Config.DotCMSHost}/api/vtl/sitesearch`, {
        method: 'POST',
        headers: Config.Headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    }, 'getSiteSearch');
  } catch (error) {
    console.error('Error fetching search results:', error);
    return null;
  }
};
