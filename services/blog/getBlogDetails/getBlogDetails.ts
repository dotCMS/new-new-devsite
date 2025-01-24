import { client } from '@/util/dotcmsClient';
import { DEFAULT_LIMIT, DEFAULT_DEPTH } from './config';
import type { TGetBlogDetails, TBlogDetailsResponse } from './types';
import { logRequest } from '@/util/logRequest'; 

export const getBlogDetails = async ({ urlmap }: TGetBlogDetails): Promise<TBlogDetailsResponse | null> => {
  try {
    const response = await logRequest(async () => {
      return await client.content
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
