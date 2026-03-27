import { SIZE_PAGE } from './config';
import { logRequest } from '@/util/logRequest'; 
import {  graphqlResults } from '@/services/gql';

/** Escape a value for use inside Lucene quoted term (query_string). */
function luceneQuotedTerm(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Embed full Lucene query in GraphQL string literal — inner " must be escaped.
 */
function assembleQuery(luceneQuery: string, limit: number, page: number, sortBy: string) {
  const escaped = luceneQuery.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `query ContentAPI {
      DotcmsbuildsCollection(
          query: "${escaped}"
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
}

export const getChangelog = async ({ page = 1, vLts = "false", singleVersion = "", limit = SIZE_PAGE }) => {
  //Basic type info for querying any changelogs at all
  const buildQuery =
  '+contentType:Dotcmsbuilds +Dotcmsbuilds.released:true +Dotcmsbuilds.showInChangeLog:true +live:true';

  //Build query components to grab one of each of the LTS major versions, for reference
  const ltsQueryMaj = '+Dotcmsbuilds.lts:1';
  const sortByEol = 'Dotcmsbuilds.eolDate desc';
  const ltsMajorQuery = assembleQuery(`${buildQuery} ${ltsQueryMaj}`, limit, page, sortByEol);
  const ltsMajorResults =  await logRequest(async () => graphqlResults(ltsMajorQuery), 'getLTSMajorVersions');
  const ltsMajorResult = ltsMajorResults?.data;

  if (!ltsMajorResult?.DotcmsbuildsCollection ) {

    console.error('GraphQL errors in getLTSMajorVersions:', ltsMajorResults.errors);
    throw new Error(ltsMajorResults.errors[0].message);
  }

  // If singleVersion is provided while already scoped to LTS (lts=…), detect patch lines
  // (e.g. 23.1.2 under tag 23.1). Skip when v is used alone on "current" — otherwise short
  // tags like "26" match calver minors such as 26.03.23-01 and we drop the minor filter.
  let ltsPatchVersion = "";
  if (singleVersion && vLts && vLts !== "false") {
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
  const sortBy = 'Dotcmsbuilds.releasedDate desc, Dotcmsbuilds.minor desc';
  // Quote minor so hyphens (e.g. 26.03.23-01) are not parsed as Lucene operators.
  const minorClause =
    singleVersion && !ltsPatchVersion
      ? `+Dotcmsbuilds.minor:"${luceneQuotedTerm(singleVersion)}"`
      : '';
  const luceneQuery = `${buildQuery} ${ltsQuery} ${ltsMajVersion} ${minorClause}`.trim();
  const query = assembleQuery(luceneQuery, ltsMajVersion ? 20 : limit, page, sortBy);
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
