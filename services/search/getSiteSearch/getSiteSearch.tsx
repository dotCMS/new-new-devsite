import { ConfigDict } from '@/utils/constants';
import type { TSiteSearh, TSearchResult } from './types';
import { logRequest } from '@/utils/logRequest'; 

export const getSiteSearch = async ({
  searchTerm,
  searchPlace = '',
  isAllSourcesSearch = false,
  currentPage = 0
}: TSiteSearh): Promise<TSearchResult | null> => {
  try {
    const requestBody = {
      q: isAllSourcesSearch ? `+uri:/${searchPlace}/* ${searchTerm}` : searchTerm,
      p: currentPage - 1 || 0
    };

    await logRequest(async () => {
      const response = await fetch(`${ConfigDict.DotCMSHost}/api/vtl/sitesearch`, {
        method: 'POST',
        headers: ConfigDict.Headers,
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
