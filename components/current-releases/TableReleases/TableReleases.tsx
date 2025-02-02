"use client";
import { type FC } from "react";

import { useCurrentRelease } from "@/hooks/useCurrentRelease";
import { extractDateForTables } from "@/util/formatDate";
import { Copy, Check,Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
export const TableReleases: FC<{}> = () => {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const {data,loading,error} = useCurrentRelease();
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
  if (!data?.releases) return <>No data</>;
  const releases = data.releases;
  const latestReleases = releases.filter((release) => release.lts === "3")[0];
  const latestLtses = releases.filter((release) => release.lts === "1");
  const ltses: typeof latestLtses = [];
  const ltsesMap = new Map();
  for (let i = 0; i < latestLtses?.length; i++) {
    const version = latestLtses[i]?.minor.split("v")[0];
    const keyVersion = version.split(".")[0] + "." + version.split(".")[1];
    if (ltsesMap.has(keyVersion)) {
      continue;
    }
    latestLtses[i].keyVersion = keyVersion;

    ltsesMap.set(keyVersion, latestLtses[i]);
    ltses.push(latestLtses[i]);
    ltses.sort((a, b) => b.keyVersion.localeCompare(a.keyVersion));
  }
  //ltses.sort((a, b) => a.keyVersion.localeCompare(b.keyVersion));
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

  if (!Array.isArray(releases) || releases.length === 0) return <>No data</>;
  return (
    <div className="w-full">
      <p className="m-6 text-gray-500 dark:text-gray-400">
        The latest Current and LTS releases are available as supported docker
        images. Click to copy the Docker image tag (will include the entire
        docker image name).
      </p>
      <div className="min-w-[50%] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Release Type
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Version
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Docker Tag
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Released
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                EOL Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">Current</td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                <Link href={`changelogs?lts=true#v${latestReleases?.minor}`}>
                  {latestReleases?.minor}
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <code className="font-mono">
                    {latestReleases?.dockerImage}
                  </code>
                  <button
                    onClick={() => handleCopy(latestReleases?.dockerImage || '', "current")}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    aria-label="Copy docker image"
                  >
                    {copiedStates["current"] ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                {extractDateForTables(latestReleases?.releasedDate)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                {extractDateForTables(latestReleases?.eolDate)}
              </td>
            </tr>
            {ltses?.map((latestLts, index) => (
              <tr key={`lts-${index}-${latestLts.minor}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className={`px-6 py-4 text-sm text-gray-900 dark:text-gray-100 ${isEolPassed(latestLts?.eolDate) ? 'line-through' : ''}`}>
                  LTS
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  <Link 
                    href={`changelogs?lts=true#v${latestLts?.minor}`}
                    className={`${isEolPassed(latestLts?.eolDate) ? 'line-through' : ''}`}
                  >
                    {latestLts?.minor}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <code className={`font-mono ${isEolPassed(latestLts?.eolDate) ? 'line-through' : ''}`}>
                      {latestLts?.dockerImage}
                    </code>
                    <button
                      onClick={() => handleCopy(latestLts?.dockerImage || '', `lts${index + 1}`)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      aria-label="Copy docker image"
                    >
                      {copiedStates[`lts${index + 1}`] ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </td>
                <td className={`px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono ${isEolPassed(latestLts?.eolDate) ? 'line-through' : ''}`}>
                  {extractDateForTables(latestLts?.releasedDate)}
                </td>
                <td className={`px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono ${isEolPassed(latestLts?.eolDate) ? 'line-through' : ''}`}>
                  {extractDateForTables(latestLts?.eolDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
