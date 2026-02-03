"use client";

import { DotCMSLayoutBody, useEditableDotCMSPage } from "@dotcms/react";
import { pageComponents } from "@/components/content-types";
import Header from "./header/header";
import Footer from "./footer";

export function PageAsset({ pageContent }) {
    const { pageAsset, content = {} } = useEditableDotCMSPage(pageContent);
    const navigation = content.navigation;

    if (!pageAsset) {
        return null;
    }

    console.log("editablePageAsset", pageAsset);
    return (
        <div className="flex flex-col gap-6 min-h-screen bg-slate-50">
            {pageAsset?.layout?.header && (
                <Header navItems={navigation?.children} />
            )}

            <main className="container m-auto">
                <DotCMSLayoutBody
                    page={pageAsset}
                    components={pageComponents}
                    mode={process.env.NEXT_PUBLIC_DOTCMS_MODE}
                />
            </main>

            {pageAsset?.layout?.footer && <Footer {...content} />}
        </div>
    );
}