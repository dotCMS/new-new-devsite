import { getGraphqlResults } from "@/util/gql";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { notFound } from "next/navigation";
import BlogDetailComponent from "../../../components/content-types/blogs/blog-detail";


export async function generateMetadata({ params, searchParams }) {
    const finalParams = await params;
    const slug = finalParams.slug

    if(!slug) {
        return notFound();
    }
    const post = await getBlogDetailQuery(slug);

    return {
        title: post.title,
        canonical: `${post.host.hostname}/blog/${post.urlTitle}`,
    };
}



async function getBlogDetailQuery(urlTitle) {

    const query = `query ContentAPI {
        BlogCollection(
        query: "+blog.urlTitle_dotraw:${urlTitle} +live:true"
        limit: 1
        offset: 0
        sortBy: "blog.postingDate"
        ) {
        title
        postingDate
        imageCredit
        host {
            hostName
        }
            
        urlTitle
    		author{
          firstName 
          lastName
          company
          linkedin
          twitter
          image{
            versionPath
            
          }
        }
        categories {
            name
            key
        }
        identifier
        inode
        teaser
        body{
            json
        }
        thumbnailAlt
        tags
        image {
            fileAsset{
            versionPath
            }
            description
        }
        }
    }
  `
    return getGraphqlResults(query).then(data => data.BlogCollection[0]);
}

export default async function BlogPage({ searchParams, params }) {
    const finalParams = await params;
    const slug = finalParams.slug

    if(!slug) {
        return notFound();
    }
    const post = await getBlogDetailQuery(slug);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="flex flex-1">
                <main className="flex-1">
                    <BlogDetailComponent post={post} />
                </main>
            </div>

            <Footer />
        </div>
    )
}

