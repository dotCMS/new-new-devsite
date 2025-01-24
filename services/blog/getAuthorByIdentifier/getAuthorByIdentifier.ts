import { client } from '@/util/dotcmsClient';
import { type TAuthor } from './types';
import { logRequest } from '@/util/logRequest'; 

export const getAuthorByIdentifier = async ({ identifier }: { identifier: string }): Promise<TAuthor | null> => {
  if (!identifier) return null;

  try {
    const query = `+identifier:${identifier}`;

    const response = await logRequest(async () => {
      return await client.content.getCollection('Contributor').query(query);
    }, `getAuthorByIdentifier identifier: ${identifier}`); 

    return (response?.contentlets[0] as unknown) as TAuthor | null;
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      console.error('Bad Request: Invalid identifier or query', error.response.data);
    } else {
      console.error('Error fetching Contributor', error);
    }

    return null;
  }
};
