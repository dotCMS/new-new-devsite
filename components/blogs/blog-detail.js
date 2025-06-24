"use client";

import { client } from "@/util/dotcmsClient";
import Link from 'next/link';
import { DotBlockEditor } from '@/components/shared/dotBlockEditor';
import OnThisPage from '@/components/navigation/OnThisPage';
import React from 'react';
import { DetailHeader } from './blog-header';
import Authors from './authors';  
import BlogComponent from "./blog-component";

export default function BlogDetailComponent({ post }) {

    const customRenderers = {};

    return (
        <div className="container mx-auto px-2 sm:px-4 lg:px-6">
            {/* Main Content Grid */}
            <div className="flex flex-col xl:flex-row gap-4 py-4 sm:py-8">
                {/* Main Content */}
                <article className="xl:flex-1 xl:max-w-4xl max-w-4xl">
                    <main>
                        <DetailHeader post={post} />
                        
                        <BlogComponent body={post.body.json} />
                    </main>
                </article>

                {/* Right Sidebar */}
                <aside className="w-full xl:w-56 xl:shrink-0">
                    <div className="sticky top-16 xl:block xl:pl-4">
                        <Authors authors={post.author} />
                        <OnThisPage selectors="main h1, main h2, main h3, main h4, .dot-block-editor h1, .dot-block-editor h2, .dot-block-editor h3, .dot-block-editor h4" />
                    </div>
                </aside>
            </div>
        </div>
    );
}   