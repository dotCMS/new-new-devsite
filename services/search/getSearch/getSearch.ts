
import { type TGetSearch } from './types';
import { Config } from '@/util/config';
import { getServerHeaders } from '@/util/headers-config';import { logRequest } from '@/util/logRequest'; 

export const getSearch = async ({ searchTerm, typeDoc, currentPage }: TGetSearch) => {
  const contentType = typeDoc ? 'dotcmsdocumentation' : '';

  try {

    const data = await logRequest(async () => {
      const response = await fetch(`${Config.DotCMSHost}/api/v1/ai/search`, {
        method: 'POST',
        headers: getServerHeaders(),
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
