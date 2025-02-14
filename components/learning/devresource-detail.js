"use client";

import { client } from "@/util/dotcmsClient";
import Link from 'next/link';
import { DotBlockEditor } from '@/components/shared/dotBlockEditor';
import OnThisPage from '@/components/navigation/OnThisPage';
import React from 'react';

import { DevResourceHeader } from './devresource-header';
import { resources } from "./resources";
import { ErrorPage } from "@/components/error";


export default function DevResourceDetailComponent({ devResource }) {
    const myResources = resources.filter((resource) => resource.type === devResource.type1[0]);
    if (myResources.length === 0) {
        return <ErrorPage error={{message:"Resource not found",status:404}} />
    }
    const myResource = myResources[0]

    const customRenderers = {};

    return (
        <div className="container mx-auto">
            {/* Main Content Grid */}
            <div className="flex gap-4 py-8 ">


                {/* Main Content */}
                <article className="flex-1 px-4 max-w-4xl">

                <DevResourceHeader devResource={devResource} myResource={myResource}/>
                    
                    
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