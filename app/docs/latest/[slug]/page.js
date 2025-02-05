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
    const path = "/docs/latest/" + (slug || "getting-started");
    const { pageAsset } = await fetchPageData(path, finalSearchParams);
    console.log("gotpage",pageAsset.title);
    return {
        title: (pageAsset.urlContentMap._map.navTitle || pageAsset.urlContentMap._map.title) + " | dotCMS Documentation",
        description: pageAsset.urlContentMap._map.seoDescription,
        keywords: pageAsset.urlContentMap._map.tag,
        openGraph: {
            title: (pageAsset.urlContentMap._map.navTitle || pageAsset.urlContentMap._map.title) + " | dotCMS Documentation",
            description: pageAsset.urlContentMap._map.seoDescription,
            keywords: pageAsset.urlContentMap._map.tag,
        }
    };
}


export default async function Home({ searchParams, params }) {
    const finalParams = await params;
    const finalSearchParams = await searchParams;
    const headersList = await headers();


    const slug = finalParams.slug;
    const path = "/docs/latest/" + (slug || "getting-started");
    const { pageAsset, sideNav, query } = await fetchPageData(path, finalSearchParams);
    const data = {
        contentlet: pageAsset.urlContentMap._map,
        sideNav: sideNav,
        currentPath: slug,
        searchParams: finalSearchParams
    }


    // Add more path-component mappings here as needed:
    // "path-name": (contentlet) => <ComponentName contentlet={contentlet} />,
    const componentMap = {
        "changelogs": (data) => <ChangeLogList {...data} slug={slug}     />,
        "current-releases": (data) => <CurrentReleases  {...data} slug={slug} />,
        "all-releases": (data) => <AllReleases  {...data} slug={slug} />,
        "previous-releases": (data) => <AllReleases  {...data} slug={slug} />,
        "known-security-issues": (data) => <AllSecurityIssues  {...data} slug={slug} />,
        
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