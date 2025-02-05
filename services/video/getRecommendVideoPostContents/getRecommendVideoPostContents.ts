import { client } from '@/util/dotcmsClient';
import type { TGetRecommendVideoPostContents, TRecommendVideoResponse } from './types';
import { DEFAULT_LIMIT, DEFAULT_DEPTH } from './config';
import { Config } from '@/util/config';
import { logRequest } from '@/util/logRequest'; 

export const getRecommendVideoPostContents = async (
  { categories }: TGetRecommendVideoPostContents
): Promise<TRecommendVideoResponse[] | null> => {
  try {
    const extractCategories = (categories: Array<{ [key: string]: string }> | null): string[] => {
      if (!categories || !Array.isArray(categories)) return [];
      return categories.map((categoryObj) => Object.keys(categoryObj)[0]);
    };

    const extractedCategories = extractCategories(categories);
    let categoryQuery = '';

    if (extractedCategories.length > 0) {
      categoryQuery = ` +categories:${extractedCategories[0]}`;
    }

    const response = await logRequest(async () => {
      return await client.content
        .getCollection('Video')
        .sortBy([
          {
            field: 'Video.publishDate',
            order: 'desc'
          }
        ])
        .limit(DEFAULT_LIMIT)
        .query(`+Video.show:true +live:true +conhostname:dotcms.dev${categoryQuery}`)
        .depth(DEFAULT_DEPTH)
        .language(Config.LanguageId);
    }, `getRecommendVideoPostContents categories: ${extractedCategories[0]}`); 

    return response?.contentlets as TRecommendVideoResponse[];
  } catch (error) {
    console.error(`Error fetching Videos`, error);
    return null;
  }
};
