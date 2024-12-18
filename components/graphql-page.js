"use client";

import React, { useEffect } from "react";
import Header from "./header/header";
import Footer from "./footer";
import { usePathname } from "next/navigation";
import Doc from "./content-types/doc";
import { initEditor, isInsideEditor, postMessageToEditor } from '@dotcms/client';


export function MyGraphQLPage({ pageAsset, nav, query, tableOfContents, params }) {
    const pathname = usePathname();

    useEffect(() => {
        if (!isInsideEditor()) {
            return;
        }

        initEditor({ pathname });
        postMessageToEditor({ action: "client-ready" });
    }, [pathname]);

    const { urlContentMap } = pageAsset || {};

    return (
        <div className="flex flex-col min-h-screen">
            {pageAsset.layout.header && (
                <Header />
            )}

            <div className="flex flex-1">
                <main className="flex-1 p-4">
                    <Doc contentlet={urlContentMap._map} tableOfContents={tableOfContents} currentPath={params.slug} />
                </main>
            </div>

            {pageAsset.layout.footer && <Footer />}
        </div>
    );
}

