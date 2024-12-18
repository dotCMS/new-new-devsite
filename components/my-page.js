"use client";

import WebPageContent from "./content-types/webPageContent";

import Header from "./header/header";
import Footer from "./footer";
import { usePathname, useRouter } from "next/navigation";
import { DotcmsLayout } from "@dotcms/react";
// import { withExperiments } from "@dotcms/experiments";
// import { CustomNoComponent } from "./content-types/empty";

import { usePageAsset } from "../hooks/usePageAsset";
import NotFound from "@/app/not-found";

/**
 * Configure experiment settings below. If you are not using experiments,
 * you can ignore or remove the experiment-related code and imports.
 */
// const experimentConfig = {
//     apiKey: process.env.NEXT_PUBLIC_EXPERIMENTS_API_KEY, // API key for experiments, should be securely stored
//     server: process.env.NEXT_PUBLIC_DOTCMS_HOST, // DotCMS server endpoint
//     debug: process.env.NEXT_PUBLIC_EXPERIMENTS_DEBUG, // Debug mode for additional logging
// };

// Mapping of components to DotCMS content types
const componentsMap = {
    webPageContent: WebPageContent,
};

export function MyPage({ pageAsset, nav }) {
    const { replace } = useRouter();
    const pathname = usePathname();

    /**
     * If using experiments, `DotLayoutComponent` is `withExperiments(DotcmsLayout)`.
     * If not using experiments:
     * - Replace the below line with `const DotLayoutComponent = DotcmsLayout;`
     * - Remove DotExperimentsProvider from the return statement.
     */
    // const DotLayoutComponent = experimentConfig.apiKey
    //     ? withExperiments(DotcmsLayout, {
    //           ...experimentConfig,
    //           redirectFn: replace,
    //       })
    //     : DotcmsLayout;

    pageAsset = usePageAsset(pageAsset);

    if (!pageAsset) {
        return <NotFound />;
    }

    return (
        <div>
            {pageAsset?.layout.header && (
                <Header></Header>
            )}

            <main className="container mx-auto px-4">
                <DotcmsLayout
                    pageContext={{
                        pageAsset,
                        components: componentsMap
                    }}
                    config={{
                        pathname,
                        editor: {
                            params: {
                                depth: 3
                            }
                        }
                    }}
                />
            </main>

            {pageAsset?.layout.footer && <Footer />}
        </div>
    );
}