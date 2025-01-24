import dotClient from '@/services/dotcmsClient';
import { type TGetContentParams } from './types';
import { type TDotCMSClient } from '@/types/dotCMSClient';
import { DEFAULT_LANGUAGE_ID, DEFAULT_DEPTH, DEFAULT_MODE, EDIT_MODE } from './config';
import { isInsideEditor } from '@dotcms/client';
import { logRequest } from '@/utils/logRequest'; 

export const getContentByPath = async ({
  searchParams = {},
  path
}: TGetContentParams): Promise<TDotCMSClient | any> => {
  try {
    const pageAsset = await logRequest(() => 
      dotClient.page.get({
        path: path as string,
        language_id: (searchParams.language_id as number) || DEFAULT_LANGUAGE_ID,
        depth: DEFAULT_DEPTH,
        mode: searchParams.mode || (isInsideEditor() ? EDIT_MODE : DEFAULT_MODE)
      }),
      `getContentByPath path: ${path}`
    );

    if (!pageAsset) {
      throw new Error('No content returned from getContentByPath');
    }

    return pageAsset as TDotCMSClient;
  } catch (error) {
    console.error(`GetContentByPath error, path: ${path} ${JSON.stringify(error)}`);
    return { error };
  }
};
