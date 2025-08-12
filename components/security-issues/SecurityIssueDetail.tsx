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
import PaginationBar from "@/components/PaginationBar";
import { useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { SecurityOrderBy } from "@/services/docs/getSecurityIssues/types";
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
    <div className="markdown-content">
      <h1 className="text-4xl font-bold mb-6">{issue.title}</h1>

      <div className="mb-6">
        <Link
          href="known-security-issues"
          className="text-primary-purple hover:opacity-80 underline hover:no-underline flex items-center"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            className="mr-2"
            fill="currentColor"
          >
            <path d="M10.78 19.03a.75.75 0 0 1-1.06 0l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L5.81 11.5h14.44a.75.75 0 0 1 0 1.5H5.81l4.97 4.97a.75.75 0 0 1 0 1.06Z"></path>
          </svg>
          Back to Security Issues
        </Link>
      </div>

      <Table className="border-border border border-collapse mb-6">
        <TableBody>
          <TableRow>
            <TableHead className="text-[15px] font-semibold bg-muted px-4 border-border border-r last:border-r-0">
              Issue:
            </TableHead>
            <TableCell className="text-base leading-7 text-foreground px-4 border-border border-r last:border-r-0">
              {issue.issueNumber}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead className="text-[15px] font-semibold bg-muted px-4 border-border border-r last:border-r-0">
              Published
            </TableHead>
            <TableCell className="text-base leading-7 text-foreground px-4 border-border border-r last:border-r-0">
              {extractDateForTables(issue.publishDate)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead className="text-[15px] font-semibold bg-muted px-4 border-border border-r last:border-r-0">
              Title:
            </TableHead>
            <TableCell className="text-base leading-7 text-foreground px-4 border-border border-r last:border-r-0">
              {issue.title}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead className="text-[15px] font-semibold bg-muted px-4 border-border border-r last:border-r-0">
              Severity:
            </TableHead>
            <TableCell className="text-base leading-7 text-foreground px-4 border-border border-r last:border-r-0">
              {issue.severity == "4"
                  ? "Critical"
                  : issue.severity == "3"
                  ? "High"
                  : issue.severity == "2"
                  ? "Medium"
                  : "Low"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead className="text-[15px] font-semibold bg-muted px-4 border-border border-r last:border-r-0">
              Requires Admin:
            </TableHead>
            <TableCell className="text-base leading-7 text-foreground px-4 border-border border-r last:border-r-0">
              {issue.requiresAdminAccess ? "Yes" : "No"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead className="text-[15px] font-semibold bg-muted px-4 border-border border-r last:border-r-0">
              Fix Versions:
            </TableHead>
            <TableCell className="text-base leading-7 text-foreground px-4 border-border border-r last:border-r-0">
              {issue.fixVersion}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead className="text-[15px] font-semibold bg-muted px-4 border-border border-r last:border-r-0">
              Credit:
            </TableHead>
            <TableCell className="text-base leading-7 text-foreground px-4 border-border border-r last:border-r-0">
              {issue.credit}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead className="text-[15px] font-semibold bg-muted px-4 border-border border-r last:border-r-0">
              Description
            </TableHead>
            <TableCell className="text-base leading-7 text-foreground px-4 border-border border-r last:border-r-0">
              <DangerousHtmlComponent content={issue.description}/>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead className="text-[15px] font-semibold bg-muted px-4 border-border border-r last:border-r-0">
              Mitigation:
            </TableHead>
            <TableCell className="text-base leading-7 text-foreground px-4 border-border border-r last:border-r-0">
              <DangerousHtmlComponent content={issue.workaround}/>
            </TableCell>
          </TableRow>
          {issue.example && (
            <TableRow>
              <TableHead className="text-[15px] font-semibold bg-muted px-4 border-border border-r last:border-r-0">
                Example:
              </TableHead>
              <TableCell className="text-base leading-7 text-foreground px-4 border-border border-r last:border-r-0">
                <DangerousHtmlComponent content={issue.example}/>
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableHead className="text-[15px] font-semibold bg-muted px-4 border-border border-r last:border-r-0">
              Issue Links:
            </TableHead>
            <TableCell className="text-base leading-7 text-foreground px-4 border-border border-r last:border-r-0">
              <DangerousHtmlComponent content={issue.issueLinks}/>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
