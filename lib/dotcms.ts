import { DotCmsClient } from "@dotcms/client";

// Check if required environment variables are set
const dotcmsUrl = process.env.NEXT_PUBLIC_DOTCMS_HOST;
const authToken = process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN;

if (!dotcmsUrl || !authToken) {
  throw new Error("Missing required environment variables for DotCMS client initialization");
}

// Client for content fetching
export const client = DotCmsClient.init({
    dotcmsUrl: dotcmsUrl,
    authToken: authToken,
    siteId: "173aff42881a55a562cec436180999cf",
    requestOptions: {
        // In production you might want to deal with this differently
        cache: "no-cache",
    }
});