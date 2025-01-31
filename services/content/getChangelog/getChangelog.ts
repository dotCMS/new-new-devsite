


import { SIZE_PAGE } from './config';
import { logRequest } from '@/util/logRequest'; 
import { getGraphqlResults } from '@/util/gql';


export const getChangelog = async ({ page = 1, isLts = false,limit = SIZE_PAGE, lts=false }) => {

  const ltsQuery = lts ? '+(Dotcmsbuilds.lts:1 Dotcmsbuilds.lts:2)' : '+Dotcmsbuilds.lts:3';
  const buildQuery =
    '+contentType:Dotcmsbuilds +Dotcmsbuilds.released:true +Dotcmsbuilds.showInChangeLog:true +live:true';


  const query = `query ContentAPI {
    DotcmsbuildsCollection(
        query: "${buildQuery} ${ltsQuery}"
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

const data = await logRequest(async () => getGraphqlResults(query), 'getChangelog');

return {changelogs: data.DotcmsbuildsCollection, pagination: data.Pagination[0]};
};


