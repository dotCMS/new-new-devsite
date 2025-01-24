import { type TPostNewsletter } from './types';

export const postNewsletter = async ({ email, name }: TPostNewsletter): Promise<string | null> => {
  try {
    const LINK = 'https://www.dotcms.com'; // TO DO: Chnage in the future?
    const data = {
      fields: [{ email, name }],
    };

    const response = await fetch(`${LINK}/api/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Submission failed: Status ${response.status}, Error ${errorText}`);
      return null;
    }

    const responseData = await response.json();
    const { redirectUri } = responseData;

    if (!redirectUri) {
      console.error('Error: redirectUri is missing in the response data.');
      return null;
    }

    const { pathname } = new URL(redirectUri);

    return pathname;

  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.warn('Network request failed; returning null to suppress error overlay.');
      return null;
    }
    console.error('Error in postNewsletter:', error);
    return null;
  }
};
