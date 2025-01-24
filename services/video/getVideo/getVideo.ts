import { DEFAULT_LIMIT } from './config';
import { client } from '@/util/dotcmsClient';
import { logRequest } from '@/util/logRequest'; 

export const getVideo = async ({ limit }: { limit: number }) => {
  try {
    const response = await logRequest(async () => {
      return await client.content
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

    return response?.contentlets;
  } catch (error) {
    console.error(`Error fetching Videos`, error);
    return null;
  }
};
