import { client } from '@/util/dotcmsClient';
import { type TBlogBanner } from './types';
import { logRequest } from '@/util/logRequest';

export const getBlogBanner = async (): Promise<TBlogBanner | null> => {
  try {
    const response = await logRequest(async () => {
      return await client.content
        .getCollection('Banner')
        .query(`+identifier:f943a93113b555cd9a98305206a30b7f`);
    }, 'getBlogBanner identifier f943a93113b555cd9a98305206a30b7f');

    return response?.contentlets[0] as TBlogBanner;
  } catch (error) {
    console.error('Error fetching Banner', error);
    return null;
  }
};
