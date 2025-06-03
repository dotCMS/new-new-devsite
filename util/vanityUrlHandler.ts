import { permanentRedirect, redirect } from "next/navigation";

interface VanityUrlRedirectOptions {
  forwardTo: string;
  action: number;
  uri: string;
}

/**
 * Vanity URL handler
 * This function will handle the vanity URL redirect
 *
 * More info about Vanity URL: https://dotcms.com/docs/latest/vanity-urls
 * NextJS Navigation:
 *  - permanentRedirect: https://nextjs.org/docs/app/building-your-application/routing/redirecting#permanentredirect-function
 *  - redirect: https://nextjs.org/docs/app/building-your-application/routing/redirecting#redirect-function
 *
 * @param {VanityUrlRedirectOptions} options - The options for the vanity URL redirect
 */
export function handleVanityUrlRedirect({
  action,
  forwardTo,
  uri, //unused for now
}: VanityUrlRedirectOptions): void {
  if (action === 302) {
    redirect(forwardTo);
  } else {
    permanentRedirect(forwardTo);
  }
}

