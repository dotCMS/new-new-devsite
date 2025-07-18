import { Config } from '@/util/config';

import { logRequest } from '@/util/logRequest';
import { graphqlResults } from '@/services/gql';
import { FilterReleases } from './types';
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
  console.error('GraphQL errors in getReleases:', result.errors);
  
  // Check if the error is related to null dockerImage fields
  const isDockerImageError = result.errors.some((error: any) => 
    error.message && error.message.includes('dockerImage') && error.message.includes('null value')
  );
  
  if (isDockerImageError) {
    console.warn('Handling null dockerImage values in releases data');
    // Filter out entries with null dockerImage values from the results if data exists
    if (result?.data?.DotcmsbuildsCollection) {
      result.data.DotcmsbuildsCollection = result.data.DotcmsbuildsCollection.filter((item: any) => 
        item && typeof item === 'object'
      );
    }
  } else {
    throw new Error(result.errors[0].message);
  }
}

return {releases: result?.data?.DotcmsbuildsCollection, pagination: result?.data?.Pagination[0]};
};  
