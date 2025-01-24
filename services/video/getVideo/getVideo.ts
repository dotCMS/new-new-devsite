import { DEFAULT_LIMIT } from './config';
import dotClient from '@/services/dotcmsClient';
import { logRequest } from '@/utils/logRequest'; 

export const getVideo = async ({ limit }) => {
  try {
    const response = await logRequest(async () => {
      return await dotClient.content
        .getCollection("Video")
        .query('+Video.show:true +live:true +conhostname:dotcms.dev')
        .limit(limit || DEFAULT_LIMIT)
        .sortBy([
          {
            field: "Video.publishDate",
            order: "desc",
          },
        ]);
    }, `getVideo limit: ${limit}`);

    return response.contentlets;
  } catch (error) {
    console.error(`Error fetching Videos`, error);
    return null;
  }
};
