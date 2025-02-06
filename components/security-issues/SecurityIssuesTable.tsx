"use client";
import { type FC } from "react";
import { useSecurityIssues } from "@/hooks/useSecurityIssues";
import { extractDateForTables } from "@/util/formatDate";
import {
  Loader2,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import PaginationBar from "@/components/PaginationBar";
import { useSearchParams } from "next/navigation";

import { SecurityOrderBy } from "@/services/docs/getSecurityIssues/types";
import { useRouter } from "next/navigation";

export const SecurityIssuesTable: FC<{
  limit?: number;
  page?: number;
  issueNumber?: string;
  orderBy?: SecurityOrderBy;
  token?: string;
}> = ({
  limit = 50,
  page = 1,
  orderBy = SecurityOrderBy.DEFAULT,
  issueNumber = "",
  token = "",
}) => {
  const router = useRouter();

  const {
    data: securityIssues,
    pagination: pagination,
    loading,
    error,
  } = useSecurityIssues(token, limit, issueNumber, page, orderBy);

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
        Error loading security issues: {error.message}
      </div>
    );
  }

  if (!securityIssues) return <>No data</>;

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-6">Known Security Issues</h1>
      <div className="min-w-[50%] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Issue
              </th>

              <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
                Published
              </th>

              <th className="px-6 py-4 t text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
                Title
              </th>
              <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
                Severity
              </th>

              <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 text-center max-w-[100px]">
                Fix Versions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {securityIssues.map((issue, index) => (
              <tr
                key={`lts-${index}-${issue.issueNumber}`}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer "
                onClick={() => {
                  router.push(
                    `/docs/known-security-issues?issueNumber=${issue.issueNumber}`
                  );
                }}
              >
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {issue.issueNumber}
                </td>

                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-center text-nowrap">
                  {extractDateForTables(issue.publishDate)}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {issue.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center text-nowrap">
                  {issue.severity == "4"
                    ? "Critical"
                    : issue.severity == "3"
                    ? "High"
                    : issue.severity == "2"
                    ? "Medium"
                    : "Low"}
                </td>

                <td
                  className={`px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center  `}
                >
                  {issue.fixVersion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagination.totalPages > 1 && (
          <div className="m-6">
            <PaginationBar pagination={pagination} additionalQueryParams={``} />
          </div>
        )}
      </div>
    </div>
  );
};
