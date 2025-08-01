import { SIZE_PAGE } from './config';
import { logRequest } from '@/util/logRequest'; 
import {  graphqlResults } from '@/services/gql';

export const getChangelog = async ({ page = 1, vLts = "false", singleVersion = "", limit = SIZE_PAGE }) => {
  const assembleQuery = (buildQuery:string, ltsQuery:string, ltsMajVersion:string, singleVersion:string,
                          limit:number, page:number, sortBy:string) => {
    return `query ContentAPI {
      DotcmsbuildsCollection(
          query: "${buildQuery} ${ltsQuery} ${ltsMajVersion} ${singleVersion}"
          limit: ${limit}
          page: ${page}
          sortBy: "${sortBy}"
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
          tags
          eolDate
          parent {
            eolDate
            releasedDate
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
  };
  
  //Basic type info for querying any changelogs at all
  const buildQuery =
  '+contentType:Dotcmsbuilds +Dotcmsbuilds.released:true +Dotcmsbuilds.showInChangeLog:true +live:true';

  //Build query components to grab one of each of the LTS major versions, for reference
  const ltsQueryMaj = '+Dotcmsbuilds.lts:1';
  const sortByEol = 'Dotcmsbuilds.eolDate desc';
  const ltsMajorQuery = assembleQuery(buildQuery, ltsQueryMaj, "", "", limit, page, sortByEol);
  const ltsMajorResults =  await logRequest(async () => graphqlResults(ltsMajorQuery), 'getLTSMajorVersions');
  const ltsMajorResult = ltsMajorResults?.data;

  if (!ltsMajorResult?.DotcmsbuildsCollection ) {

    console.error('GraphQL errors in getLTSMajorVersions:', ltsMajorResults.errors);
    throw new Error(ltsMajorResults.errors[0].message);
  }

  //if singleVersion is provided, check if it's an LTS patch version
  let ltsPatchVersion = "";
  if(singleVersion){
    for(const item of ltsMajorResult.DotcmsbuildsCollection){
      for (const vTag of item.tags){
        if(singleVersion.startsWith(vTag) && singleVersion !== vTag){
          vLts = vTag;
          ltsPatchVersion = vTag;
          break;
        }
      }
      if(ltsPatchVersion){
        break;
      }
    }
  }

  //Build query components to grab requested changelogs
  const ltsQuery = (vLts && vLts !== "false") ? '+(Dotcmsbuilds.lts:1 Dotcmsbuilds.lts:2)' : '+Dotcmsbuilds.lts:3';
  const sussOutLatestMajor = (majVersion:any, paramVersion:string) => {
    if(/^\d/.test(paramVersion)){
      return `+Dotcmsbuilds.tags:${paramVersion}`
    } else if(paramVersion === "true"){
      for (const vTag of majVersion.tags) {
        if(/^\d/.test(vTag)) {
          return `+Dotcmsbuilds.tags:${vTag}`;
        }
      }
      return "";
    } else return "";
  };
  const ltsMajVersion = sussOutLatestMajor(ltsMajorResult.DotcmsbuildsCollection[0], vLts);
  //console.log("sussed as:", ltsMajVersion);
  const sortBy = 'Dotcmsbuilds.releasedDate desc, modDate desc';
  const query = assembleQuery(buildQuery, ltsQuery, ltsMajVersion, (singleVersion && !ltsPatchVersion) ? `+Dotcmsbuilds.minor:${singleVersion}` : "", (ltsMajVersion ? 20 : limit), page, sortBy);
  const result = await logRequest(async () => graphqlResults(query), 'getChangelog');
  
  if (result?.errors && result.errors.length > 0) {
    console.error('GraphQL errors in getChangelog:', result.errors);
    
    // Check if the error is related to null dockerImage fields
    const isDockerImageError = result.errors.some((error: any) => 
      error.message && error.message.includes('dockerImage') && error.message.includes('null value')
    );
    
    if (isDockerImageError) {
      console.warn('Handling null dockerImage values in changelog data');
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

  return {changelogs: result?.data?.DotcmsbuildsCollection, pagination: result?.data?.Pagination[0], ltsMajors: ltsMajorResult.DotcmsbuildsCollection, ltsSingleton: ltsPatchVersion};
};
