import { ConfigDict } from '@/util/constants';
import { SIZE_PAGE } from './config';
import { logRequest } from '@/util/logRequest';
import { getGraphqlResults } from '@/util/gql';

export const getCurrentRelease = async () => {
  const buildQuery = '+contentType:Dotcmsbuilds +Dotcmsbuilds.download:1 +Dotcmsbuilds.released:true +live:true';



  const query = `query ContentAPI {
    DotcmsbuildsCollection(
        query: "${buildQuery} "
    limit: 50
    page: 1
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

const data = await logRequest(async () => getGraphqlResults(query), 'getCurrentRelease');

return {releases: data.DotcmsbuildsCollection, pagination: data.Pagination[0]};
};
