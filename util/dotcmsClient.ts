import { createDotCMSClient } from "@dotcms/client";
import { Config } from "./config";
// Check if required environment variables are set
const dotcmsUrl = Config.DotCMSHost;
const authToken = Config.AuthToken;

if (!dotcmsUrl || !authToken) {
  throw new Error("Missing required environment variables for DotCMS client initialization");
}


// Client for content fetching
export const client = createDotCMSClient({
    dotcmsUrl: dotcmsUrl,
    authToken: authToken,
    siteId: "173aff42881a55a562cec436180999cf",
    requestOptions: {
        next: { revalidate: 60 }  // ISR: revalidate cached data every 60 seconds
    }
});