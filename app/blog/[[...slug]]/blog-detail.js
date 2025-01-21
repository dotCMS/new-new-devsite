"use client"

import { format } from "date-fns";
import { getGraphqlResults } from "@/lib/gql";
import Link from 'next/link';
import { Calendar, Clock, Tag, User } from 'lucide-react';
import { DotBlockEditor } from '@/components/shared/dotBlockEditor';
import { Heading, Paragraph } from '@/components/shared/dotBlockEditor';

async function getBlogDetailQuery (urlTitle) {

    const query =`query ContentAPI {
        BlogCollection(
        query: "+blog.urlTitle_dotraw:${urlTitle} +live:true +(conhost:SYSTEM_HOST conhost:173aff42881a55a562cec436180999cf)"
        limit: 10
        offset: 0
        sortBy: "blog.postingDate"
        ) {
        title
        postingDate
        urlTitle
        body{
            json
        }
        categories {
            name
            key
        }
        identifier
        inode
        teaser
    
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

export default async function BlogDetail({ pageAsset, urlContentMap }) {

    const post = await  getBlogDetailQuery(urlContentMap.urlTitle);

    const imageUrl = post.image?.fileAsset?.versionPath;
    const formattedDate = format(new Date(post.postingDate), 'MMMM dd, yyyy');
    const customRenderers = {};
    return (
        <article className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header Section */}
            <header className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {post.title} : Detail
                </h1>
                
                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={post.postingDate}>{formattedDate}</time>
                    </div>
                    {post.categories && (
                        <div className="flex flex-wrap gap-2">
                            {post.categories.map((category) => (
                                <span key={category.key} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
                                    {category.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            {/* Featured Image */}
            {imageUrl && (
                <figure className="mb-8">
                    <img
                        src={imageUrl}
                        alt={post.teaser || post.title}
                        className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                    />
                    {post.image?.description && (
                        <figcaption className="mt-2 text-sm text-gray-600 text-center">
                            {post.image.description}
                        </figcaption>
                    )}
                </figure>
            )}

            {/* Teaser */}
            <div className="prose prose-lg max-w-none mb-8">
                <h1 className="text-xl text-gray-700 leading-relaxed">
                    {post.teaser}
                </h1>
            </div>

            {/* Tags */}
            {post.tags && (
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                            >
                                <Tag className="w-4 h-4" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="prose prose-lg max-w-none mb-8">
                <h1 className="text-xl text-gray-700 leading-relaxed">
                <DotBlockEditor
                blocks={post.body.json}
                    className="prose max-w-none"
                    customRenderers={{
                        ...{customRenderers},
                        heading: Heading,
                        paragraph: Paragraph
                    }}
                />
                    
                </h1>
            </div>


            {/* Article Navigation */}
            <div className="border-t border-gray-200 pt-6 mt-8">
                <div className="flex justify-between">
                    <Link
                        href="/blog"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        ← Back to Blog
                    </Link>
                </div>
            </div>
        </article>
    );
}

