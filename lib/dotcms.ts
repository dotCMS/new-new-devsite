import { DotCMS } from 'dotcms';

export const dotcms = new DotCMS({
  host: process.env.NEXT_PUBLIC_DOTCMS_HOST || 'https://demo.dotcms.com',
  token: process.env.DOTCMS_API_TOKEN
});