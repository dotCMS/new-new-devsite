"use client";

import Header from "./header/header";
import Footer from "./footer";
import { usePathname } from "next/navigation";
import Doc from "./content-types/Documentation";
import { initEditor, isInsideEditor, postMessageToEditor } from '@dotcms/client';
import { useEffect } from 'react';

export function PageGraphQL({ pageAsset, nav, query, sideNav, params, pathname }) {
    const clientPathname = usePathname();

    useEffect(() => {
        if (!isInsideEditor()) {
            return;
        }

        initEditor({ pathname: clientPathname });
        postMessageToEditor({ action: "client-ready" });
    }, [clientPathname]);

    const { urlContentMap } = pageAsset || {};

    return (
        <div className="flex flex-col min-h-screen">
            {pageAsset.layout.header && (
                <Header />
            )}

            <div className="flex flex-1">
                <main className="flex-1 p-4">
                    <Doc contentlet={urlContentMap._map} sideNav={sideNav} currentPath={params.slug} />
                </main>
            </div>

            {pageAsset.layout.footer && <Footer />}
        </div>
    );
}

