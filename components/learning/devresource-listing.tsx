import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, ArrowLeft } from 'lucide-react';
import TagCloud from '@/components/shared/TagCloud';
import Image from 'next/image';
import { resources } from "@/components/learning/resources"
import { getTagsByLuceneQuery } from "@/services/getTags";
import { devResourceBaseQuery } from "@/services/learning/getDevResources";
import PaginationBar from '../PaginationBar';
import { ErrorPage } from '../error';

export default async function DevResourceListing({ devResources, pagination, tagFilter, type }: { devResources: any, pagination: any, tagFilter: string, type: string }) {
    const myResources = resources.filter((resource) => resource.type === type);
    if (myResources.length === 0) {
        return <ErrorPage error={{message:"Resource not found",status:404}} />
    }
    const myResource = myResources[0]
    const allTags = await getTagsByLuceneQuery(devResourceBaseQuery(type), 30);
    const tagFilterQueryParam = tagFilter && tagFilter.length > 0 ? "tagFilter=" + tagFilter : "";
    
    return (
        <div>
            {/* Hero Header */}
            <div className="relative h-[200px] my-6 rounded-t-3xl  overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={myResource.image}
                        alt={myResource.title}
                        width={1024}
                        height={1024}
                        className="object-cover w-full h-full"
  
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/70 to-gray-900/30" />
                </div>
                <div className="container mx-auto px-4 h-full relative">
                    <div className="flex flex-col justify-center h-full max-w-3xl px-8">
                        <div className="text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <myResource.icon className="w-8 h-8" />
                                <h1 className="text-4xl font-bold">
                                    dotCMS : {myResource.title}
                                </h1>
                            </div>
                            <p className="text-xl text-white/90 px-2 break-words whitespace-normal">
                                {myResource.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <Link 
                    prefetch={false}

                    href="/learning" 
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 w-fit group transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Learning Center</span>
                </Link>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pb-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {devResources.map((resource: any) => (
                                <article key={resource.identifier} className="bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-border">
                                    <div className="relative">
                                        {resource.image?.modDate ? (
                                        <Link href={`/learning/${resource.slug}`} prefetch={false} className="block">

                                                <Image
                                                    src={"/dA/" + resource.identifier + "/" + resource.inode}
                                                    alt={resource.teaser || resource.title}
                                                    width={1024}
                                                    height={1024}
                                                    className="w-full h-48 object-cover rounded-t-lg"
                                                />
                                            </Link>
                                        ) : (
                                            <div className="w-full h-48 bg-muted rounded-t-lg" />
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <Calendar className="w-4 h-4" />
                                            <time dateTime={resource.publishDate}>
                                                {format(new Date(resource.publishDate), 'MMMM d, yyyy')}
                                            </time>
                                        </div>
                                        <h2 className="text-xl font-bold mb-3 line-clamp-2 break-words">
                                            <Link href={`/learning/${resource.slug}`} prefetch={false} className="hover:text-primary transition-colors">
                                                {resource.title}
                                            </Link>
                                        </h2>
                                        <p className="text-muted-foreground mb-4 line-clamp-3 break-words whitespace-normal">{resource.teaser}</p>
                                        {resource.tags && resource.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {resource.tags.map((tag: string) => (
                                                    <Link
                                                        key={"resourceTags-" + tag}
                                                        href={`?tagFilter=${encodeURIComponent(tag)}`}
                                                        prefetch={false}
                                                        className="text-xs px-3 py-1 bg-muted hover:bg-muted/80 text-muted-foreground rounded-full transition-colors"
                                                    >
                                                        {tag}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                            
                        {/* Pagination UI */}
                        <div className="m-8">
                            <PaginationBar pagination={pagination} additionalQueryParams={tagFilterQueryParam}/>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-80 shrink-0">
                        <TagCloud tags={allTags} selectedTag={tagFilter} />
                    </div>
                </div>
            </div>
        </div>
    );
}
