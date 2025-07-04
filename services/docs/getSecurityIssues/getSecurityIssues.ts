
import { logRequest } from '@/util/logRequest';
import { graphqlResults } from '@/services/gql';
import { SecurityOrderBy } from './types';
export const getSecurityIssues = async (
    limit: number = 50, 
    page: number = 1, 
    orderBy: SecurityOrderBy = SecurityOrderBy.DEFAULT, 
    log: boolean = false,
    issueNumber:string = "" ,
    token:string = ""
) => {
        
  var buildQuery = ' +live:true ';

  if (token) {
    buildQuery += ` +SecurityIssue.token:(${token})`;
  }else{
    buildQuery += ` -SecurityIssue.token:(* TO *)`;
  }

  if (issueNumber && issueNumber != "") {
    buildQuery += ` +SecurityIssue.issueNumber:${issueNumber}`;
  }


  var orderByValue = 'SecurityIssue.publishDate desc';
  console.log("orderBy",orderBy);
  if (orderBy === SecurityOrderBy.SEVERITY) {
    orderByValue += ' SecurityIssue.severity desc';
  }else if (orderBy === SecurityOrderBy.FIX_VERSION) {
    orderByValue += 'SecurityIssue.fixVersion desc';
  }




  const query = `query ContentAPI {
    SecurityissueCollection(
        query: "${buildQuery} "
    limit: ${limit}
    page: ${page}
    sortBy: "${orderByValue}"
  ) {
    title
    tags
    issueNumber
    index
    severity
    requiresAdminAccess
    publishDate
    fixVersion
    credit
    description1
    token
    description
    example
    workaround
    issueLinks
    
  }
  Pagination {
    fieldName
    totalPages
    totalRecords
    pageRecords
    hasNextPage
    hasPreviousPage
    pageSize
    page
    offset
  }
}`;

if (log) {
  console.log("query",query);
}
const result = await logRequest(async () => graphqlResults(query), 'getSecurityIssues');

if (result?.errors && result.errors.length > 0) {
  console.error('GraphQL errors in getSecurityIssues:', result.errors);
  throw new Error(result.errors[0].message);
}

return {securityIssues: result?.data?.SecurityissueCollection, pagination: result?.data?.Pagination[0]};
};
