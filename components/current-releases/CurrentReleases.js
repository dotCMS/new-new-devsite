"use client";


import Breadcrumbs from "../navigation/Breadcrumbs";

import { TableReleases } from "./TableReleases/TableReleases";
export default function CurrentReleases({ sideNav, slug }) {


  return (

    <>
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
        />

        <div className="markdown-content">
          <h1 className="text-4xl font-bold mb-6">Current Releases</h1>
          <TableReleases />
        </div>
      </main>

    </div>
  </>

  );
}
