"use client";

import Breadcrumbs from "../navigation/Breadcrumbs";
import { TableReleases } from "./TableReleases/TableReleases";
import { DockerComposeYAML } from "./DockerComposeYAML/DockerComposeYAML";
import React, { useState } from 'react';

export default function CurrentReleases({ sideNav, slug }) {
  const [selectedRelease, setSelectedRelease] = useState(null);

  return (
    <div className="max-w-[1400px] mx-auto flex">
      {/* Main Content Area */}
      <main
        className="flex-1 min-w-0 pt-8 px-12
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
      >
        <Breadcrumbs
          items={sideNav[0]?.dotcmsdocumentationchildren || []}
          slug={slug}
          childrenKey="dotcmsdocumentationchildren"
        />

        <div className="markdown-content">
          <h1 className="text-4xl font-bold mb-6">Current Releases</h1>
          <p className="mb-6">
          </p>
          <TableReleases downloadYAML={true} />
          <h2 className="text-2xl font-bold my-6">
            Download and Try It Out!
          </h2>
          <p className="mb-6">
            Spin up your own local dotCMS container using <a href="https://docs.docker.com/get-docker/" 
            className="text-blue-500">Docker</a> in mere moments: Just download the desired version&apos;s 
            file to your chosen working directory and use <code className="bg-gray-100 dark:bg-gray-800 
            p-1 rounded-md">docker compose up</code>.</p>
            
          <p className="mb-6"> Your local instance will be ready to use in minutes, 
            at <code className="bg-gray-100 dark:bg-gray-800 p-1 rounded-md">http://localhost:8082</code>.
          </p>
          
          <p className="mb-6">For more information, 
            see <a href="logging-into-dotcms" className="text-blue-500">Logging Into dotCMS</a>.</p>
        </div>
      </main>
    </div>
  );
}
