"use client";
import { type FC } from "react";
import { useReleases, useCurrentReleases } from "@/hooks/useReleases";
import { extractDateForTables } from "@/util/formatDate";
import { Copy, Check, Loader2, Link2Off, Link2, ExternalLink, Medal,Trophy } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import PaginationBar from "@/components/PaginationBar";
import { useSearchParams } from "next/navigation";
import { FilterReleases } from '@/services/docs/getReleases/types';

export const TableReleases: FC<{showCurrent: boolean, limit?: number, page?: number, filter?: FilterReleases, version?: string}> = ({
  showCurrent=true,
  limit=40,
  page=1,
  filter=FilterReleases.ALL,
  version=""
}) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const currentReleases = useCurrentReleases();
  const searchParams = useSearchParams();
  var currentPage = Number(searchParams.get("page")) || 1;
  if (currentPage < 1) {
    currentPage = 1;
  }

  // Only show LTS column when viewing LTS or ALL releases
  const showLtsColumn = filter !== FilterReleases.CURRENT;

  const {data: regularReleases, loading, error} = useReleases(limit, currentPage, filter, false, version);
  const pagination = showCurrent ? {} : regularReleases?.pagination;
  
  const releaseMap = currentReleases.reduce((acc, release) => {
    acc[release.minor] = {version: release.minor, lts: release.lts, eolDate: release.eolDate, isLatest: release.lts === "3"};
    return acc;
  }, {} as Record<string, {version: string, lts: string, eolDate: string, isLatest: boolean}>);

  const latestLts = currentReleases.filter((release) => release.lts !== "3").sort((a, b) => a.minor - b.minor)[0];
  const latestCurrent = currentReleases.filter((release) => release.lts === "3").sort((a, b) => a.minor - b.minor)[0];
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

  const releases = showCurrent ? currentReleases : regularReleases?.releases;
  if (!releases) return <>No data</>;

  // Filter out null or undefined entries
  const filteredReleases = releases.filter((release): release is NonNullable<typeof release> => 
    release !== null && release !== undefined
  );

  if (filteredReleases.length === 0) return <>No data</>;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const isEolPassed = (eolDate: string) => {
    return new Date(eolDate) < new Date();
  };

  return (
    <div className="w-full">

      <div className="min-w-[50%] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Version
              </th>
              
                <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
                  Type
                </th>
 
              <th className="px-6 py-4 t text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
                Docker Tag
              </th>
              <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
                Released
              </th>
              {showLtsColumn && (
                <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
                  EOL Date
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {filteredReleases.map((release, index) => (
              <tr 
                key={`lts-${index}-${release.minor}`} 
                className={`transition-colors ${
                    releaseMap[release.minor] && !isEolPassed(release.eolDate)?
                    'bg-green-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700'
                   : isEolPassed(release.eolDate)
                    ? 'bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >

                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  <Link href={`changelogs?v=${release.minor}`}>
                    {release.minor}
                  </Link>
                </td>
                
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-center">
                    {releaseMap[release.minor] && release.lts === "3" 
                        ? (
                            <>
                            <Trophy className="w-4 m-2 h-4 border-0 border-red-500   inline-block" />
                            &nbsp;
                            <span className="inline-block ">Latest</span>
                            </>
                        )
                         
                        : releaseMap[release.minor] && release.lts !== "3"
                            ? "Latest LTS"
                            : release.lts !== "3" 
                                ? "LTS" 
                                : "-"}
                  </td>
               
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  <div className="flex items-center space-x-2  overflow-hidden justify-center">
                    <code className="font-mono">

                      {release.dockerImage && release.dockerImage.includes("dotcms/dotcms:") &&(
                      <>{release.dockerImage.replace("dotcms/dotcms:", "")}
                            <button
                            onClick={() => handleCopy(release.dockerImage || '', `lts${index + 1}`)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            aria-label="Copy docker image"
                            >
                            {copiedStates[`lts${index + 1}`] ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                            </button>
                            </>
                      )
                    }
                    {!(release.dockerImage && release.dockerImage.includes("dotcms/dotcms:")) && (

                        <Link href={`https://static.dotcms.com/versions/dotcms_${release.minor}.tar.gz`}>
                            tar.gz <ExternalLink className="w-4 h-4 text-gray-500 dark:text-gray-400 inline-block" />
                        </Link>
                    )}
                    

                    </code>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono text-center text-nowrap">
                  {extractDateForTables(release.releasedDate)}
                </td>
                {showLtsColumn && (   
                <td className={`px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center text-nowrap font-mono ${isEolPassed(release.eolDate) ? 'line-through' : ''}`}>
                  {release.lts === "3" ? "-" : extractDateForTables(release.eolDate)}
                </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!showCurrent && (
          <div className="m-6">
            <PaginationBar pagination={pagination} additionalQueryParams={`filter=${filter}&version=${version}`} />
          </div>
        )}
      </div>
    </div>
  );
};