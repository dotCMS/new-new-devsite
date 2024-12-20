import { permanentRedirect, redirect } from "next/navigation";

interface VanityUrlRedirectOptions {
  forwardTo: string;
  temporaryRedirect?: boolean;
  permanentRedirect?: boolean;
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
  forwardTo,
  temporaryRedirect,
  permanentRedirect: isPermanentRedirect,
}: VanityUrlRedirectOptions): void {
  if (temporaryRedirect) {
    redirect(forwardTo);
  } else if (isPermanentRedirect) {
    permanentRedirect(forwardTo);
  }
}

