import { DEFAULT_DEPTH } from './config';
import { client } from '@/util/dotcmsClient';
import type { TGetSearchFilter, TContentlet } from './types';
import { logRequest } from '@/util/logRequest'; 

export const getSearchFilter = async ({
  author,
  limit,
  tag,
  search,
  category,
  collectionType = 'Blog'
}: TGetSearchFilter) => {

  const searchValue = typeof search === 'string' ? search : search?.value;

  try {
    const response = await logRequest(async () => {
      return await client.content
        .getCollection(collectionType)
        .sortBy([
          {
            field: 'modDate',
            order: 'desc'
          }
        ])
        .limit(+limit)
        .query(`+${collectionType === 'Blog' ? 'Blog.showInListing:true' : 'Video.show:true'} +conhostname:dotcms.dev ${author ? `+author:${author}` : ''} ${tag ? `+tag:${tag}` : ''} ${searchValue ? `+title:${searchValue}` : ''} ${(category && category !== 'All') ? `+categories:${category}` : ''}`)
        .depth(DEFAULT_DEPTH);
    }, `getSearchFilter collectionType: ${collectionType}, limit: ${limit}`);

    const contentlets = response?.contentlets as TContentlet[] || [];

    return { newContent: contentlets, resultsSize: response?.total || 0 };

  } catch (error) {
    console.error(`Error fetching Blogs`, error);
    return { newContent: [], resultsSize: 0 };
  }
};
