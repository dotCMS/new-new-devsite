import { DotCmsClient } from "@dotcms/client";
import { ConfigDict } from "./constants";
// Check if required environment variables are set
const dotcmsUrl = ConfigDict.DotCMSHost;
const authToken = ConfigDict.AuthToken;

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