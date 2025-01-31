"use client";

import WebPageContent from "./content-types/webPageContent";
import Header from "./header/header";
import Footer from "./footer";
import Hero from "./content-types/hero";
import Heading from "./content-types/heading";
import LinkCards from "./content-types/link-cards"
import APIPlaygrounds from "./content-types/api-playgrounds";
import RelatedBlogs from "./content-types/related-blogs";
import { usePathname, useRouter } from "next/navigation";
import { DotcmsLayout } from "@dotcms/react";
import { usePageAsset } from "../hooks/usePageAsset";
import NotFound from "@/app/not-found";


const componentsMap = {
    webPageContent: WebPageContent,
    DocumentationHero: Hero,
    Heading: Heading,
    DocumentationLinks: LinkCards,
    DocumentationApiPlaygrounds: APIPlaygrounds,
    RelatedBlogs: RelatedBlogs
};

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