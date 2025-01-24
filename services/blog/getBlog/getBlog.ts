import { DEFAULT_LIMIT, DEFAULT_DEPTH } from './config';
import { client } from '@/util/dotcmsClient';
import { type TBlog } from './types';
import { logRequest } from '@/util/logRequest';

export const getBlog = async ({ limit }: { limit: number }): Promise<TBlog[] | null> => {
  try {
    const response = await logRequest(async () => {
      return await client.content
        .getCollection('Blog')
        .sortBy([
          {
            field: 'Blog.postingDate',
            order: 'desc'
          }
        ])
        .limit(+limit || DEFAULT_LIMIT)
        .query(`+Blog.showInListing:true +live:true +conhostname:dotcms.dev`)
        .depth(DEFAULT_DEPTH);
    }, `getBlog limit: ${limit}`); 

    return response?.contentlets as TBlog[] || [];
  } catch (error) {
    console.error(`Error fetching Blogs`, error);
    return null;
  }
};
