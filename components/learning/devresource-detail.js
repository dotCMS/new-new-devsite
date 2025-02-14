"use client";

import { client } from "@/util/dotcmsClient";
import Link from 'next/link';
import { DotBlockEditor } from '@/components/shared/dotBlockEditor';
import OnThisPage from '@/components/navigation/OnThisPage';
import React from 'react';



export default function DevResourceDetailComponent({ devResource }) {

    const customRenderers = {};

    return (
        <div className="container mx-auto">
            {/* Main Content Grid */}
            <div className="flex gap-4 py-8 ">


                {/* Main Content */}
                <article className="flex-1 px-4 max-w-4xl">


                    
                    
                    <div className="prose prose-lg max-w-none mb-8">
                        <DotBlockEditor
                            blocks={devResource.body.json}
                            
                        />
                    </div>
                </article>

                {/* Right Sidebar */}
                <div className="w-64 shrink-0 hidden xl:block">
                    <div className="sticky top-16">
                        <OnThisPage />
                    </div>
                </div>
            </div>
        </div>
    );
}   