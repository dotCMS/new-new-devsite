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
        <div className="container mx-auto w-full min-w-0 max-w-full">
            {/* Main Content Grid */}
            <div className="flex w-full min-w-0 flex-col gap-4 py-8 xl:flex-row">


                {/* Main Content */}
                <article className="w-full min-w-0 max-w-4xl flex-1 px-4">

                    <DetailHeader post={post} />
                    
                    <BlogComponent body={post.body.json} />
                </article>

                {/* Right Sidebar */}
                <div className="hidden w-64 shrink-0 xl:block">
                    <div className="sticky top-16">
                        <Authors authors={post.author} />
                        <OnThisPage />
                    </div>
                </div>
            </div>
        </div>
    );
}   