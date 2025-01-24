import { client } from '@/util/dotcmsClient';
import { logRequest } from '@/util/logRequest';

export const getCardContent = async (identifier: string) => {
  try {
    const response = await logRequest(async () => {
      return await client.content
        .getCollection('CardContent')
        .query(`+identifier:${identifier}`);
    }, `getCardContent identifier ${identifier}`);

    return response?.contentlets[0];
  } catch (error) {
    console.error('Error fetching Banner', error);
    return null;
  }
};
