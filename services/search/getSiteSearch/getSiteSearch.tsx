import { Config } from '@/util/config';
import type { TSiteSearh, TSearchResult } from './types';
import { logRequest } from '@/util/logRequest';

export const getSiteSearch = async ({
  searchTerm,
  searchPlace = '',
  isAllSourcesSearch = false,
  currentPage = 0,
}: TSiteSearh): Promise<TSearchResult | null> => {
  try {
    const requestBody = {
      q: isAllSourcesSearch ? `+uri:/${searchPlace}/* ${searchTerm}` : searchTerm,
      // VTL expects 0-based page index
      p: Math.max(0, currentPage || 0),
    };

    const data = await logRequest(async () => {
      const response = await fetch(`${Config.DotCMSHost}/api/vtl/sitesearch`, {
        method: 'POST',
        headers: Config.Headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.json() as Promise<TSearchResult>;
    }, 'getSiteSearch');

    return data;
  } catch (error) {
    console.error('Error fetching search results:', error);
    return null;
  }
};
