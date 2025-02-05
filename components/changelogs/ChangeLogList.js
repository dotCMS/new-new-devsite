"use client";

import OnThisPage from "../navigation/OnThisPage";
import ChangeLogEntry from "./ChangeLogEntry";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { useChangelog } from "@/hooks/useChangelog";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Breadcrumbs from "../navigation/Breadcrumbs";
import PaginationBar from "../PaginationBar";

export default function ChangeLogContainer({ sideNav, slug }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLts = searchParams.get("lts") === "true";
  var currentPage = Number(searchParams.get("page")) || 1;
  if (currentPage < 1) {
    currentPage = 1;
  }

  const { data, loading, error, hasNextPage, hasPrevPage } = useChangelog(
    currentPage,
    isLts
  );

  const handleVersionToggle = (isLtsVersion) => {
    const params = new URLSearchParams(searchParams);
    params.set("lts", isLtsVersion);
    params.set("page", "1"); // Reset to first page when switching versions
    router.push(`?${params.toString()}`);
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

  return (
    <div className="max-w-[1400px] mx-auto flex">
      <main
        className="flex-1 px-12
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
      >
        <a id="top" className="text-4xsm opacity-0"></a>
        <Breadcrumbs
          items={sideNav[0]?.dotcmsdocumentationchildren || []}
          slug={slug}
        />
        <div className="flex flex-col gap-6 mb-8">
          <h1 className="text-4xl font-bold">dotCMS Changelogs</h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleVersionToggle(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !isLts
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              Agile
            </button>
            <button
              onClick={() => handleVersionToggle(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isLts
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              LTS
            </button>
          </div>
        </div>

        {data.changelogs.map((item, index) => (
          <ChangeLogEntry key={item?.identifier || index} item={item} index={index} />
        ))}

        <div className="mt-8 mb-12">
            <PaginationBar pagination={data.pagination} currentPage={data.pagination.page} additionalQueryParams={`lts=${isLts}`} />
        </div>
      </main>
      <div className="w-64 shrink-0 hidden xl:block">
        <div className="sticky top-16 pt-8 pl-8">
          <div className="text-muted-foreground">
            {hasPrevPage && (
              <a
                title="Newer Releases"
                className="block border-0 border-red-500 pl-3 pb-4 text-sm"
                href={`?page=${currentPage - 1}&lts=${isLts}`}
              >
                &larr; Newer 
              </a>
            )}

            <OnThisPage
              selectors={"main h2"}
              showOnThisPage={false}
              className="border-2 border-red-500"
            />

            {hasNextPage && (
              <a
                title="Older Releases"
                className="block border-0 border-red-500 pl-3 pt-2 text-sm"
                href={`?page=${currentPage + 1}&lts=${isLts}`}
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
