import { notFound } from "next/navigation";
import { headers } from 'next/headers';

import { graphqlToPageEntity, getPageRequestParams } from "@dotcms/client";

import { getGraphqlResults, getGraphQLPageQuery } from "@/services/gql";

import { getSideNav } from "@/services/docs/getSideNav"
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import Documentation from "@/components/documentation/Documentation";
import ChangeLogList from "@/components/changelogs/ChangeLogList";
import NavTree from "@/components/navigation/NavTree";
import CurrentReleases from "@/components/releases/CurrentReleases";
import AllReleases from "@/components/releases/AllReleases";
import AllSecurityIssues from "@/components/security-issues/AllSecurityIssues";
import RestApiPlayground from "@/components/playgrounds/RestApiPlayground/RestApiPlayground";
import SwaggerUIComponent from "@/components/playgrounds/SwaggerUIComponent/SwaggerUIComponent";

async function fetchPageData(path, searchParams) {
    const finalPath = await path;
    const finalSearchParams = await searchParams;
    const pageRequestParams = getPageRequestParams({ path: finalPath, params: finalSearchParams });
    const query = getGraphQLPageQuery(pageRequestParams);
    const [pageData, sideNav] = await Promise.all([
        getGraphqlResults(query),

        getSideNav()
    ]);


    const pageAsset = graphqlToPageEntity(pageData);

    if (!pageAsset) {
        notFound();
    }

    return { pageAsset, sideNav, query, currentPath: finalPath };
}

/**
 * Generate metadata
 *
 * @export
 * @param {*} { params, searchParams }
 * @return {*}
 */
export async function generateMetadata({ params, searchParams }) {
    const finalParams = await params;
    const finalSearchParams = await searchParams;
    const slug = finalParams.slug;
    const path = "/docs/" + (slug || "table-of-contents");
    const hostname = "https://dev.dotcms.com";
    const { pageAsset } = await fetchPageData(path, finalSearchParams);

    return {
        title: (pageAsset.urlContentMap._map.navTitle || pageAsset.urlContentMap._map.title) ,
        description: pageAsset.urlContentMap._map.seoDescription,
        keywords: pageAsset.urlContentMap._map.tag,
        openGraph: {
            title: (pageAsset.urlContentMap._map.navTitle || pageAsset.urlContentMap._map.title) ,
            description: pageAsset.urlContentMap._map.seoDescription,
            keywords: pageAsset.urlContentMap._map.tag,

            url: `${hostname}${path}`,
            siteName: 'dotCMS Docs',
            images: [{
                url: `${hostname}/dA/4b13a794db115b14ce79d30850712188/1024maxw/80q/}`,
                width: 1200,
                height: 630,
                alt: pageAsset.urlContentMap._map.seoDescription || pageAsset.urlContentMap._map.navTitle,
            }],
            locale: 'en_US',
            type: 'article',


        },

        alternates: {
            canonical: `${hostname}${path}`,
        },
        metadataBase: new URL(hostname),
        
    };
}


export default async function Home({ searchParams, params }) {
    const finalParams = await params;
    const finalSearchParams = await searchParams;

    const resetNav = finalSearchParams.n === "0";
    const slug = finalParams.slug;
    const path = "/docs/" + (slug || "table-of-contents");
    const { pageAsset, sideNav } = await fetchPageData(path, finalSearchParams);
    const data = {
        contentlet: pageAsset.urlContentMap._map,
        sideNav: sideNav,
        currentPath: slug,
        searchParams: finalSearchParams
    }


    // Add more path-component mappings here as needed:
    // "path-name": (contentlet) => <ComponentName contentlet={contentlet} />,
    const componentMap = {
        "changelogs": (data) => <ChangeLogList {...data} slug={slug} />,
        "current-releases": (data) => <CurrentReleases  {...data} slug={slug} />,
        "all-releases": (data) => <AllReleases  {...data} slug={slug} />,
        "previous-releases": (data) => <AllReleases  {...data} slug={slug} />,
        "known-security-issues": (data) => <AllSecurityIssues  {...data} slug={slug} />,
        "rest-api-sampler": (data) => <RestApiPlayground {...data} slug={slug} />,
        "all-rest-apis": (data) => <SwaggerUIComponent {...data} slug={slug} />,
        default: (data) => <Documentation {...data} slug={slug} />
    };


    return (
        <div className="flex flex-col min-h-screen">
            <Header sideNavItems={sideNav[0]?.dotcmsdocumentationchildren || []} currentPath={slug} />
            
            <div className="flex-1">
                <div className="flex flex-col lg:flex-row container mx-auto px-0">
                    {/* Left Navigation - Hide on mobile */}
                    <div className="hidden lg:block w-72 shrink-0">
                        <NavTree
                            items={sideNav[0]?.dotcmsdocumentationchildren || []}
                            currentPath={slug}
                            resetNav={resetNav}
                        />
                    </div>

                    {/* Main Content - Full width on mobile */}
                    <main className="flex-1 min-w-0 px-6 sm:px-6 lg:px-8">
                        {(componentMap[slug] || componentMap.default)(data)}
                    </main>
                </div>
            </div>

            {pageAsset.layout.footer && <Footer />}
        </div>
    );

}