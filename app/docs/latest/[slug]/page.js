import { notFound } from "next/navigation";
import { headers } from 'next/headers';

import { graphqlToPageEntity, getPageRequestParams } from "@dotcms/client";

import { getGraphqlResults, getGraphQLPageQuery } from "@/util/gql";

import { getSideNav } from "@/util/getSideNav"
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import Documentation from "@/components/documentation/Documentation";
import ChangeLogList from "@/components/documentation/ChangeLogList";
import { getChangelog } from "@/services/content/getChangelog/getChangelog";
import NavTree from "@/components/navigation/NavTree";

import OnThisPage from "@/components/navigation/OnThisPage";

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
    const pathname = headersList.get("x-invoke-path") || "";

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
        "changelogs": (data) => <ChangeLogList {...data} slug={slug} changelogData={getChangelog({ 
            page: finalSearchParams?.page ? finalSearchParams.page : 1, 
            isLts: finalSearchParams?.lts?true:false, limit: 10 })} />,
        default: (data) => <Documentation {...data} slug={slug} />
    };


    return (
        <div className="flex flex-col min-h-screen">
            {pageAsset.layout.header && (
                <Header />
            )}

            <div className="flex flex-1">
                <main className="flex-1 px-12">
                    <div className="container flex min-h-screen p-0">
                        {/* Left Navigation */}
                        <div className="w-72 shrink-0">
                            <NavTree
                                items={sideNav[0]?.dotcmsdocumentationchildren || []}
                                currentPath={slug}
                            />
                        </div>

                        {/* Main Content Container */}
                        <div className="flex-1 min-w-0">
                            {(componentMap[slug] || componentMap.default)(data)}
                        </div>
                    </div>


                </main>
            </div>

            {pageAsset.layout.footer && <Footer />}
        </div>
    );

}