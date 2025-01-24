import dotClient from '@/services/dotcmsClient';
import { DEFAULT_LIMIT, DEFAULT_DEPTH } from './config';
import type { TGetBlogDetails, TBlogDetailsResponse } from './types';
import { logRequest } from '@/utils/logRequest'; 

export const getBlogDetails = async ({ urlmap }: TGetBlogDetails): Promise<TBlogDetailsResponse | null> => {
  try {
    const response = await logRequest(async () => {
      return await dotClient.content
        .getCollection('Blog')
        .query(`+urlmap:${urlmap} +live:true`)
        .limit(DEFAULT_LIMIT)
        .depth(DEFAULT_DEPTH);
    }, `getBlogDetails urlmap: ${urlmap}`);

    const contentlet = response?.contentlets[0];

    if (!contentlet) {
      console.error('No content found for the given urlmap.');
      return null;
    }

    const blogDetails = contentlet as TBlogDetailsResponse;
    return blogDetails;
  } catch (error) {
    console.error(`Error fetching Blogs: ${error}`);
    return null;
  }
};
