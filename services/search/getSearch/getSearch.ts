import { type TSearchResult } from '@/types/search';
import { type TGetSearch } from './types';
import { ConfigDict } from '@/utils/constants';
import { logRequest } from '@/utils/logRequest'; 

export const getSearch = async ({ searchTerm, typeDoc, currentPage }: TGetSearch): Promise<TSearchResult | null> => {
  const contentType = typeDoc ? 'dotcmsdocumentation' : '';

  try {

    const data = await logRequest(async () => {
      const response = await fetch(`${ConfigDict.DotCMSHost}/api/v1/ai/search`, {
        method: 'POST',
        headers: ConfigDict.Headers,
        body: JSON.stringify({
          contentType,
          prompt: searchTerm,
          searchLimit: 25,
          stream: true,
          temperature: 0.5,
          threshold: 0.25,
          searchOffset: currentPage || 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.json(); 
    }, 'getSearch'); 

    return data;
  } catch (error) {
    console.error('Error fetching search results:', error);
    return null;
  }
};
