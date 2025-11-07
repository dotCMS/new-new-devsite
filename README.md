# The New New dotCMS Dev site

This is the latest and greatest version of the dotCMS documentation and dev site that powers https://dev.dotcms.com.  The site is built with NextJs 15 and the blood, sweat, tears and tokens from our AI friends Bolt.ai/Claude/Cursor/Cline &#129302;.

This auto-deploys as needed.


### Building & Running the dev site locally
To run the dev site locally, you need to set some environmental variables - either in your console or via a .env file:
```
NEXT_PUBLIC_DOTCMS_HOST={https://dotCMS that hosts the content}
NEXT_PUBLIC_CDN_HOST={https://The endpoint/CDN serving the nextJS site}
NEXT_PUBLIC_DOTCMS_AUTH_TOKEN=$DOTCMS_AUTH_TOKEN from the dotCMS that hosts the content
```
With these in place, you can
```
npm i
npm run dev
```
or 
```
npm run build
```
