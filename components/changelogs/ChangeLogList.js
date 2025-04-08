"use client";

import OnThisPage from "../navigation/OnThisPage";
import ChangeLogEntry from "./ChangeLogEntry";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { extractDateForTables } from '../../util/formatDate'
import { useChangelog } from "@/hooks/useChangelog";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Breadcrumbs from "../navigation/Breadcrumbs";
import PaginationBar from "../PaginationBar";
import Dropdown from "../shared/dropdown";
import { useState, useEffect } from "react";

export default function ChangeLogContainer({ sideNav, slug }) {
  //const router = useRouter(); // see removal of router in handleVersionChange
  const searchParams = useSearchParams();
  const paramLts = searchParams.get("lts");

  const [singleVersion, setSingleVersion] = useState(searchParams.get("v"));

  let isLts = paramLts && paramLts !== "false";
  let vLts = "";
  let currentPage = Number(searchParams.get("page")) || 1;
  if (currentPage < 1) {
    currentPage = 1;
  }

  const { data, loading, error, hasNextPage, hasPrevPage } = useChangelog(
    currentPage,
    paramLts,
    singleVersion,
  );

  // Handle hash scrolling after data is loaded
  useEffect(() => {
    if (!loading && window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        const targetScrollPos = elementTop - 80; // Match InitialScroll's HEADER_HEIGHT
        window.scrollTo({
          top: targetScrollPos,
          behavior: 'instant'
        });
      }
    }
  }, [loading]);

  const handleVersionChange = (isLtsVersion) => {
    const params = new URLSearchParams(searchParams);
    if(isLtsVersion !== "false"){
      params.set("lts", isLtsVersion);
    } else {
      params.delete("lts");
    }
    params.delete("v"); // remove this; this should be reached through links in other content only
    params.set("page", "1"); // Reset to first page when switching versions
    //router.push(`?${params.toString()}`, undefined, {shallow:false}); // switched to window.location.href to avoid shallow routing
    window.location.href = `?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive">
        Error loading changelogs: {error.message}
      </div>
    );
  }

  if (!data?.changelogs || data.changelogs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        No changelogs available
      </div>
    );
  }
  if(data.ltsSingleton){
    isLts = true;
  }
  let thisMajorVersion;
  return (
    <div className="flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto">
      {/* Main Content Area */}
      <main className="flex-1 min-w-0 py-8 lg:pb-12 px-0 sm:px-0 lg:px-8
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

        <div className="flex flex-col gap-6 mb-6">
          <h1 className="text-4xl font-bold">dotCMS Changelogs</h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleVersionChange("false")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !isLts
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              Current
            </button>
            <button
              onClick={() => handleVersionChange("true")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isLts
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              LTS
            </button>
            {
              isLts && (() => {
                const ltsMajorVersions = []; // list of LTS major versions
                const ltsEol = []; // list of boolean values indicating if the LTS version has reached EOL
                const pastEol = (eol) => { return new Date(eol) < new Date(); }
                for (const item of data.ltsMajors) { // iterate over the LTS major versions
                  for (const vTag of item.tags) { // check tags
                    if (/^\d/.test(vTag) && !ltsMajorVersions.includes(vTag)) { // if tag designates a major LTS version
                      const eol = new Date(item.eolDate);
                      ltsMajorVersions.push(vTag); // store tag
                      ltsEol.push(pastEol(eol)) // store EOL status
                      break;
                    }
                  }
                }
                vLts = paramLts === "true" ? ltsMajorVersions[0] : paramLts; // set the effective LTS version based on URL param
                if(isLts && !vLts){
                  vLts = data.ltsSingleton;
                }
                const vLtsLabel = (() => {
                  if(!ltsEol[ltsMajorVersions.indexOf(vLts)]){ // cross-reference EOL status with LTS version
                    if(vLts === ltsMajorVersions[0]){
                      return `${vLts} (Latest)`;
                    } else {
                      return vLts;
                    }
                  } else {
                    return `${vLts} (Past EOL)`;
                  }
                })();
                // just to convey the Designation/EOL dates for the entire page
                thisMajorVersion = data.ltsMajors[ltsMajorVersions.indexOf(vLts)].parent ? 
                  data.ltsMajors[ltsMajorVersions.indexOf(vLts)].parent : data.ltsMajors[ltsMajorVersions.indexOf(vLts)];
                return (
                  <Dropdown 
                    items={ltsMajorVersions}
                    label={vLtsLabel}
                    onSelect={(item) => handleVersionChange(item)}
                  />
                );
              })()
            }
          </div>
        </div>

        {
          isLts && (() => {
            return (
              <div className="text-foreground flex items-center text-xl font-semibold justify-between">
                <div>Designated: {extractDateForTables(thisMajorVersion.releasedDate)}</div>
                <div>EOL: {extractDateForTables(thisMajorVersion.eolDate)}</div>
              </div>
            )
          })()
        }

        {data.changelogs.map((item, index) => (
          <ChangeLogEntry key={item?.identifier || index} item={item} index={index} />
        ))}

        <div className="mt-8 mb-12">
          <PaginationBar pagination={data.pagination} currentPage={data.pagination.page} additionalQueryParams={isLts ? `&lts=${isLts}` : ""} />
        </div>
      </main>

      {/* Right Sidebar - Hide on smaller screens */}
      <div className="w-64 shrink-0 hidden xl:block">
        <div className="sticky top-16 pt-8 pl-8">
          <div className="text-muted-foreground
                overflow-y-auto p-4 px-2
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
                [&::-webkit-scrollbar-thumb]:rounded-full
                hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20
                h-[calc(100vh-4rem)]">
            {hasPrevPage && (
              <a
                title="Newer Releases"
                className="block border-0 border-red-500 pl-3 pb-4 text-sm"
                href={`?page=${currentPage - 1}${paramLts ? '&lts='+paramLts : ""}`}
              >
                &larr; Newer 
              </a>
            )}

            <OnThisPage
              selectors={"main h1, main h2"}
              showOnThisPage={false}
              showTitle={false}
              titleOverride={vLts ? `${vLts} LTS` : "Current"}
              className="border-2 border-red-500"
            />

            {hasNextPage && (
              <a
                title="Older Releases"
                className="block border-0 border-red-500 pl-3 pt-2 text-sm"
                href={`?page=${currentPage + 1}${paramLts ? '&lts='+paramLts : ""}`}
              >
                Older &rarr;
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
