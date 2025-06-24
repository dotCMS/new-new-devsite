import { Config } from '@/util/config';
import { getServerHeaders } from '@/util/headers-config';import { logRequest } from '@/util/logRequest';

export const getTokenAI = async (): Promise<string | null> => {
  try {
    const options = {
      method: 'GET',
      headers: getServerHeaders(),
    };

    const token = await logRequest(async () => {
      const response = await fetch(`${Config.DotCMSHost}/api/vtl/ai`, options);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data?.key;
    }, 'getTokenAI'); 

    return token;
  } catch (error) {
    console.error('Error fetching AI token:', error);
    return null;
  }
};
