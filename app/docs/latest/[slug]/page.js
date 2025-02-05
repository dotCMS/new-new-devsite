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

export default async function DocsPage({ params, searchParams }) {
    const finalParams = await params;
    const finalSearchParams = await searchParams;
    const slug = finalParams.slug;
    const path = "/docs/latest/" + (slug || "getting-started");
    
    const { pageAsset, sideNav } = await fetchPageData(path, finalSearchParams);
    
    // Component mapping for different page types
    const componentMap = {
        "changelogs": (data, nav) => <ChangeLogList contentlet={data} sideNav={nav} slug={slug} />,
        "current-releases": (data, nav) => <CurrentReleases contentlet={data} sideNav={nav} slug={slug} />,
        "all-releases": (data, nav) => <AllReleases contentlet={data} sideNav={nav} slug={slug} />,
        "previous-releases": (data, nav) => <AllReleases contentlet={data} sideNav={nav} slug={slug} />,
        "known-security-issues": (data, nav) => <AllSecurityIssues contentlet={data} sideNav={nav} slug={slug} />,
        default: (data, nav) => <Documentation contentlet={data} sideNav={nav} slug={slug} />
    };

    const Component = componentMap[slug] || componentMap.default;
    return Component(pageAsset.urlContentMap._map, sideNav);
}