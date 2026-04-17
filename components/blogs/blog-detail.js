"use client";

import { client } from "@/util/dotcmsClient";
import Link from 'next/link';
import { DotBlockEditor } from '@/components/shared/dotBlockEditor';
import OnThisPage from '@/components/navigation/OnThisPage';
import React from 'react';
import { DetailHeader } from './blog-header';
import Authors from './authors';  
import BlogComponent from "./blog-component";
import { useAssistant } from "@/components/chat/AssistantProvider";
import { useContentColumnWideLayout } from "@/hooks/useHeaderWideNav";
import { cn } from "@/util/utils";

export default function BlogDetailComponent({ post }) {

    const customRenderers = {};
    const { open: assistantOpen, expanded: assistantExpanded } = useAssistant();
    const showWideColumn = useContentColumnWideLayout(
      assistantOpen,
      assistantExpanded
    );

    return (
        <div className="container mx-auto w-full min-w-0 max-w-full">
            {/* Main Content Grid */}
            <div className="flex w-full min-w-0 flex-col gap-4 py-8 xl:flex-row xl:justify-center xl:gap-6 overflow-x-hidden">


                {/* Main Content */}
                <article className="mx-auto w-full min-w-0 max-w-4xl px-4 xl:mx-0 xl:shrink-0">

                    <DetailHeader post={post} />
                    
                    <BlogComponent body={post.body.json} />
                </article>

                {/* Right Sidebar */}
                <div
                  className={cn(
                    "w-64 shrink-0",
                    showWideColumn ? "block" : "hidden"
                  )}
                >
                    <div className="sticky top-16">
                        <Authors authors={post.author} />
                        <OnThisPage />
                    </div>
                </div>
            </div>
        </div>
    );
}   