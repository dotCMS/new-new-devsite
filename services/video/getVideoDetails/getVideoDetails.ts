import { client } from '@/util/dotcmsClient';
import { DEFAULT_LIMIT, DEFAULT_DEPTH } from './config';
import type { TGetVideoDetails, TVideoDetailsResponse } from './types';
import { Config } from '@/util/config';
import { logRequest } from '@/util/logRequest'; 

export const getVideoDetails = async ({ identifier }: TGetVideoDetails): Promise<TVideoDetailsResponse | null> => {
  try {
    const response = await logRequest(async () => {
      return await client.content
        .getCollection('Video')
        .query(`+identifier:${identifier.replace('/', '')}`)
        .limit(DEFAULT_LIMIT)
        .depth(DEFAULT_DEPTH)
        .language(Config.LanguageId);
    }, `getVideoDetails identifier: ${identifier}`); 

    const contentlet = response?.contentlets[0];

    if (!contentlet) {
      console.error('No found video content for the identifier.');
      return null;
    }

    const videoDetails = (contentlet as unknown) as TVideoDetailsResponse;
    return videoDetails;
  } catch (error) {
    console.error('Error fetching Videos', error);
    return null;
  }
};
