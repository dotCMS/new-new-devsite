import { Config } from '@/util/config';

import { logRequest } from '@/util/logRequest';
import { getGraphqlResults } from '@/services/gql';
import { FilterReleases } from './types';
export const getReleases = async (limit: number = 50, page: number = 1, filter: FilterReleases = FilterReleases.ALL, log: boolean = false, version: string = "") => {
  var buildQuery = '+contentType:Dotcmsbuilds +Dotcmsbuilds.download:1 +Dotcmsbuilds.released:true +live:true';

  if (version) {
    buildQuery += ` +Dotcmsbuilds.minor:*${version}*`;
  }
  console.log("filter",filter);
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
const data = await logRequest(async () => getGraphqlResults(query), 'getCurrentRelease');

return {releases: data.DotcmsbuildsCollection, pagination: data.Pagination[0]};
};
