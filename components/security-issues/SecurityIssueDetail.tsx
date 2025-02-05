"use client";
import { type FC } from "react";
import { useSecurityIssues } from "@/hooks/useSecurityIssues";
import { extractDateForTables } from "@/util/formatDate";
import {
  Copy,
  Check,
  Loader2,
  Link2Off,
  Link2,
  ExternalLink,
  Medal,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import PaginationBar from "@/components/changelogs/PaginationBar";
import { useSearchParams } from "next/navigation";

import { SecurityOrderBy } from "@/services/content/getSecurityIssues/types";
import { useRouter } from "next/navigation";
import DangerousHtmlComponent from "../DangerousHtmlComponent";

export const SecurityIssueDetail: FC<{
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

  if (!securityIssues || securityIssues.length == 0) return <>No data</>;

  const issue = securityIssues[0];
  return (
    <div className="w-full">

      <h2 className="text-3xl ">
         {issue.title}
      </h2>

      <div>
        <Link
          href="known-security-issues"
          className="transition-colors flex items-center text-slate-600 py-4"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            className="mr-2 my-2"
            fill="currentColor"
          >
            <path d="M10.78 19.03a.75.75 0 0 1-1.06 0l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L5.81 11.5h14.44a.75.75 0 0 1 0 1.5H5.81l4.97 4.97a.75.75 0 0 1 0 1.06Z"></path>
          </svg>{" "}
          Back to Security Issues
        </Link>
      </div>

      <div className="min-w-[50%] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">

            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100 align-top">
                Issue:
              </th>
              <td>
                {issue.issueNumber}
              </td>
            </tr>
            <tr>    
              <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 align-top">
                Published
              </th>
              <td>
                {extractDateForTables(issue.publishDate)}
              </td>
            </tr>
            <tr>
              <th className="px-6 py-4 t text-sm font-semibold text-gray-900 dark:text-gray-100 align-top">
                Title:
              </th>
              <td>
                {issue.title}
              </td>
            </tr>
            <tr>
              <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 align-top">
                Severity:
              </th> 
              <td>
                {issue.severity == "4"
                    ? "Critical"
                    : issue.severity == "3"
                    ? "High"
                    : issue.severity == "2"
                    ? "Medium"
                    : "Low"}
              </td>
            </tr>
            <tr>
              <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 align-top text-nowrap">
                Requires Admin:
              </th> 
              <td>
                {issue.requiresAdminAccess ? "Yes" : "No"}
              </td>
            </tr>


            <tr>
              <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 align-top text-nowrap">
                Fix Versions:
              </th>
              <td>
                {issue.fixVersion}
              </td>
            </tr>
            <tr>
              <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 align-top">
                Credit:
              </th>
              <td>
                {issue.credit}
              </td>
            </tr>
            <tr>
              <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100  align-top">
                Description
              </th>
              <td>
              <DangerousHtmlComponent  content={issue.description}/>
 
              </td>
            </tr>   
            <tr>
              <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 align-top">
                Mitigation:
              </th>
              <td>
                <DangerousHtmlComponent  content={issue.workaround}/>
           
              </td> 
            </tr>
            {issue.example && (
            <tr>
              <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 align-top">
                Example:
              </th>
              <td>
              <DangerousHtmlComponent  content={issue.example}/>

                </td> 
            </tr>
            )}
            <tr>
              <th className="px-6 py-4  text-sm font-semibold text-gray-900 dark:text-gray-100 align-top">
                Issue Links:
              </th>
              <td>
              <DangerousHtmlComponent  content={issue.issueLinks}/>
   
                </td>
            </tr>
       
        </table>

      </div>
    </div>
  );
};
