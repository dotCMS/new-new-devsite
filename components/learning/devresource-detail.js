"use client";

import { client } from "@/util/dotcmsClient";
import Link from 'next/link';
import { DotBlockEditor } from '@/components/shared/dotBlockEditor';
import OnThisPage from '@/components/navigation/OnThisPage';
import React from 'react';

import { DevResourceHeader } from './devresource-header';
import { resources } from "./resources";
import { ErrorPage } from "@/components/error";

const checkForType = (json, type) => {
    function traverse(node) {
      // Return true if current node is a heading
      if (node.type.toLowerCase() === type.toLowerCase()) {
        return true;
      }
      
      // Check child nodes if they exist
      if (node.content && Array.isArray(node.content)) {
        return node.content.some(child => traverse(child));
      }
      
      return false;
    }
  
    return traverse(json);
}

export default function DevResourceDetailComponent({ devResource }) {
    const myResources = resources.filter((resource) => resource.type === devResource.type1[0]);
    if (myResources.length === 0) {
        return <ErrorPage error={{message:"Resource not found",status:404}} />
    }
    const myResource = myResources[0]

    const customRenderers = {};
    const hasHeadings = checkForType(devResource.body.json, "heading");
    const isVideo = myResource.type==="video";

    return (
        <div className="container mx-auto">
            {/* Main Content Grid */}
            <div className="flex gap-4 py-8">
                {/* Main Content */}
                <article className={`px-4 ${hasHeadings ? 'flex-1 max-w-4xl' : 'w-full'}`}>
                    <main>
                        {/**    Dont show image if it is a video */}
                        <DevResourceHeader devResource={devResource} myResource={myResource} showImage={!isVideo}/>
                        <div className="prose prose-lg max-w-none mb-8">
                            <DotBlockEditor 
                                blocks={devResource.body.json}
                            />
                        </div>
                    </main>
                </article>

                {/* Right Sidebar - Only show if there are headings */}
                {hasHeadings && (
                    <div className="w-64 shrink-0 hidden xl:block">
                        <div className="sticky top-16">
                            <OnThisPage selectors="main h1, main h2, main h3, main h4, .dot-block-editor h1, .dot-block-editor h2, .dot-block-editor h3, .dot-block-editor h4" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}   