"use client";

import { initEditor, isInsideEditor, postMessageToEditor } from '@dotcms/client';

import Link from 'next/link';
import { Calendar, Tag } from 'lucide-react';
import { DotBlockEditor } from '@/components/shared/dotBlockEditor';
import { client } from '@/util/dotcmsClient';
import OnThisPage from '@/components/navigation/OnThisPage';
import React from 'react';
import { DetailHeader } from './blog-header';
export default function BlogDetailComponent({ post }) {

    const customRenderers = {};

    return (
        <div className="container mx-auto flex gap-8">
            {/* Main Content */}
            <article className="flex-1 px-4 py-8 max-w-4xl">

                <DetailHeader post={post} />
                {/* Header Section */}
                <header className="mb-8">

                </header>
                <div className="prose prose-lg max-w-none mb-8">
                    <DotBlockEditor
                        blocks={post.body.json}
                    />
                </div>

                {/* Article Navigation */}
                <div className="border-t border-gray-200 pt-6 mt-8">
                    <div className="flex justify-between">
                        <Link
                            href="/blog"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            ← Back to Blogs
                        </Link>
                    </div>
                </div>
            </article>

            {/* Right Sidebar */}
            <div className="w-64 shrink-0 hidden xl:block">
                <div className="sticky top-16 pt-8">
                    <OnThisPage />
                </div>
            </div>
        </div>
    );
}   