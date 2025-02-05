"use client";
import { useState, useEffect } from 'react';

import { TSecurityIssue, SecurityOrderBy } from '@/services/content/getSecurityIssues/types';
import { getSecurityIssues } from '@/services/content/getSecurityIssues/getSecurityIssues';


function mapSecurityIssues(securityIssueData: any[]) {

    const securityIssuesArr:TSecurityIssue[] = new Array();
    for (let i = 0; i < securityIssueData?.length; i++) {
        const issue: TSecurityIssue = securityIssueData[i];
        securityIssuesArr.push(issue);
    }
    return securityIssuesArr;
}





export function useSecurityIssues(token: string, limit: number = 50, issueNumber: string = "", page: number = 1, orderBy: SecurityOrderBy = SecurityOrderBy.DEFAULT, log: boolean = false) {
  const [data, setData] = useState<TSecurityIssue[] | null>(null);
  const [pagination, setPagination] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSecurityIssues() {
      try {
        setLoading(true);
        const result = await getSecurityIssues(limit, page, orderBy, log, issueNumber, token);
        if (result) {

          setData(mapSecurityIssues(result.securityIssues));
          setPagination(result.pagination);
        } else {
          setError(new Error('Failed to fetch security issue data'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    }

    fetchSecurityIssues();
  }, [limit, page, orderBy, log,issueNumber,token]);

  return { data, pagination, loading, error };
} 