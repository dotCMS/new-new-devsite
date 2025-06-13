"use client";

import { client } from "@/util/dotcmsClient";
import Link from 'next/link';

import OnThisPage from '@/components/navigation/OnThisPage';
import React from 'react';

import { DevResourceHeader } from './devresource-header';
import { DevResourceTypes } from "./resources";
import { ErrorPage } from "@/components/error";
import DevResourceComponent from "./devresource-component";
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

export default function DevResourceDetailPageComponent({ devResource }) {
    const myResources = DevResourceTypes.filter((resource) => resource.type === devResource.type1[0]);
    const myResource=(myResources.length>0)?myResources[0]:DevResourceTypes[0];



    const hasHeadings = checkForType(devResource.body.json, "heading");
    const isVideo = myResource.type==="video";

    return (
        <div className={`container mx-auto px-2 sm:px-4 lg:px-6 ${!hasHeadings ? 'max-w-screen-2xl' : ''}`}>
            {/* Main Content Grid */}
            <div className={`flex flex-col xl:flex-row gap-4 py-4 sm:py-8 ${!hasHeadings ? 'items-center' : ''}`}>
                {/* Main Content */}
                <article className={`${hasHeadings ? 'xl:flex-1 max-w-4xl' : 'w-full max-w-none xl:max-w-none'}`}>
                    <main>
                        {/**    Dont show image if it is a video */}
                        <DevResourceHeader devResource={devResource} myResource={myResource} showImage={!isVideo}/>
                        <DevResourceComponent body={devResource.body} />
                    </main>
                </article>

                {/* Right Sidebar - Only show if there are headings */}
                {hasHeadings && (
                    <div className="w-full xl:w-56 xl:shrink-0">
                        <div className="sticky top-16 xl:block pl-4">
                            <OnThisPage selectors="main h1, main h2, main h3, main h4, .dot-block-editor h1, .dot-block-editor h2, .dot-block-editor h3, .dot-block-editor h4" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
