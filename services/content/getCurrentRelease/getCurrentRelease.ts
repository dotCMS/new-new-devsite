
import { logRequest } from '@/util/logRequest';
import { getGraphqlResults } from '@/util/gql';

export const getCurrentRelease = async ({page = 1}) => {

  const buildQuery =
  '+contentType:Dotcmsbuilds +Dotcmsbuilds.released:true +Dotcmsbuilds.showInChangeLog:true +live:true';


const query = `query ContentAPI {
  DotcmsbuildsCollection(
      query: "${buildQuery} "
      limit: 50
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
const data = await logRequest(async () => getGraphqlResults(query), 'getCurrentRelease');



return {currentRelease: data.DotcmsbuildsCollection, pagination: data.Pagination[0]};
};
