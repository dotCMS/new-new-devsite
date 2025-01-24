import dotClient from '@/services/dotcmsClient';
import type { TRecommendBlogResponse, TGetRecommendBlogPostContents } from './types';
import { DEFAULT_LIMIT, DEFAULT_DEPTH, DEFAULT_CATEGORY } from './config';
import { logRequest } from '@/utils/logRequest';

export const getRecommendBlogPostContents = async (
  { categories }: TGetRecommendBlogPostContents = {} 
): Promise<TRecommendBlogResponse[] | null> => {
  try {
    const extractCategories = (categories: Array<{ [key: string]: string }> | null): string[] => {
      if (!categories || !Array.isArray(categories)) return [];
      return categories.map((categoryObj) => Object.keys(categoryObj)[0]);
    };

    const extractedCategories = extractCategories(categories);
    let categoryQuery = '';

    if (extractedCategories.length > 0) {
      categoryQuery = ` +categories:${extractedCategories[0]}`;
    } else {
      categoryQuery = ` +categories:${DEFAULT_CATEGORY}`; 
    }

    const response = await logRequest(async () => {
      return await dotClient.content
        .getCollection('Blog')
        .sortBy([
          {
            field: 'Blog.postingDate',
            order: 'desc'
          }
        ])
        .limit(DEFAULT_LIMIT)
        .query(`+Blog.showInListing:true +live:true +conhostname:dotcms.dev${categoryQuery}`)
        .depth(DEFAULT_DEPTH);
    }, `getRecommendBlogPostContents category: ${extractedCategories[0] || DEFAULT_CATEGORY}`);

    return response?.contentlets as TRecommendBlogResponse[];
  } catch (error) {
    console.error(`Error fetching Blogs: ${error}`);
    return null;
  }
};
