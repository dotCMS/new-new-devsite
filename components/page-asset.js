"use client";


import Header from "./header/header";
import Footer from "./footer";
import { usePathname, useRouter } from "next/navigation";
import { DotcmsLayout } from "@dotcms/react";
import { usePageAsset } from "../hooks/usePageAsset";
import NotFound from "@/app/not-found";
import { UVEComponentsMap } from "./common-component-map";



export function PageAsset({ pageAsset, nav, serverPath }) {
    const { replace } = useRouter();
    const clientPath = usePathname();
    
    // Use server path for initial render, client path for subsequent updates
    const pathname = serverPath || clientPath;

    pageAsset = usePageAsset(pageAsset);

    if (!pageAsset) {
        return <NotFound />;
    }

    return (
        <div>
            {pageAsset?.layout.header && (
                <Header />
            )}

            <main className="container mx-auto px-2 sm:px-4">
                <DotcmsLayout
                    pageContext={{
                        pageAsset,
                        components: UVEComponentsMap
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
            <div className="container mx-auto px-2 sm:px-4">
                {pageAsset?.content}

            </div>
            {pageAsset?.layout.footer && <Footer />}
        </div>
    );
}