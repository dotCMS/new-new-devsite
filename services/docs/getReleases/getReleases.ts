import { Config } from '@/util/config';

import { logRequest } from '@/util/logRequest';
import { graphqlResults } from '@/services/gql';
import { FilterReleases } from './types';

/** GraphQL field errors we can ignore when collection data is still usable. */
function isSoftGraphQLError(error: { message?: string; extensions?: { code?: string } }) {
  const message = error?.message || '';
  if (message.includes('dockerImage') && message.includes('null value')) {
    return true;
  }
  if (
    message.includes("permission to access the relationship metadata for field 'parent'") ||
    (error?.extensions?.code === 'PERMISSION_DENIED' && message.includes("'parent'"))
  ) {
    return true;
  }
  return false;
}

export const getReleases = async (limit: number = 50, page: number = 1, filter: FilterReleases = FilterReleases.ALL, log: boolean = false, version: string = "") => {
  var buildQuery = '+contentType:Dotcmsbuilds +Dotcmsbuilds.download:1 +Dotcmsbuilds.released:true +live:true';

  if (version) {
    buildQuery += ` +Dotcmsbuilds.minor:*${version}*`;
  }
  //console.log("filter",filter);
  if (filter === FilterReleases.LTS) {
    buildQuery += ' -Dotcmsbuilds.lts:3';
  }else if (filter === FilterReleases.CURRENT) {
    buildQuery += ' +Dotcmsbuilds.lts:3';
  }




  const query = `query ContentAPI {
    DotcmsbuildsCollection(
        query: "${buildQuery} "
    limit: ${limit}
    page: ${page}
    sortBy: "Dotcmsbuilds.releasedDate desc"
  ) {
    title
    minor
    releaseNotes
    releasedDate
    dockerImage
    showInChangeLog
    released
    lts
    download
    showInChangeLog
    live
    eolDate
    starterEmpty
    starter
    parent{	
      identifier
    	eolDate
    }
    
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
const result = await logRequest(async () => graphqlResults(query), 'getCurrentRelease');

if (result?.errors && result.errors.length > 0) {
  const hardErrors = result.errors.filter((error: any) => !isSoftGraphQLError(error));
  const hasCollection = Boolean(result?.data?.DotcmsbuildsCollection);

  if (hardErrors.length || !hasCollection) {
    console.error('GraphQL errors in getReleases:', result.errors);
    throw new Error(hardErrors[0]?.message || result.errors[0].message);
  }

  console.warn(
    'Soft GraphQL errors in getReleases (continuing with partial data):',
    result.errors.map((e: any) => e.message),
  );

  const isDockerImageError = result.errors.some(
    (error: any) =>
      error.message &&
      error.message.includes('dockerImage') &&
      error.message.includes('null value'),
  );
  if (isDockerImageError && result?.data?.DotcmsbuildsCollection) {
    result.data.DotcmsbuildsCollection = result.data.DotcmsbuildsCollection.filter(
      (item: any) => item && typeof item === 'object',
    );
  }
}

return {releases: result?.data?.DotcmsbuildsCollection, pagination: result?.data?.Pagination[0]};
};  
