import dotClient from '@/services/dotcmsClient';
import { logRequest } from '@/utils/logRequest';

export const getCardContent = async (identifier) => {
  try {
    const response = await logRequest(async () => {
      return await dotClient.content
        .getCollection('CardContent')
        .query(`+identifier:${identifier}`);
    }, `getCardContent identifier ${identifier}`);

    return response?.contentlets[0];
  } catch (error) {
    console.error('Error fetching Banner', error);
    return null;
  }
};
