import { logRequest } from '@/util/logRequest'; 
import { graphqlResults } from '@/services/gql';

import type { TDeprecation } from './types';

type Options = { ttlSeconds?: number };

const getDeprecations = async (options: Options = {}): Promise<TDeprecation[] | null> => {
  const ttlSeconds = options.ttlSeconds ?? 60;

  const query = `query Deprecations {
    DeprecationCollection(
      query: "+contentType:Deprecation +live:true"
      sortBy: "Deprecation.dateDeprecated asc"
      limit: 0
      offset: 0
    ) {
      identifier
      title
      dateDeprecated
      dateRetired
      timeframeNote
      docLinks {
        title
        urlTitle
      }
      recommendation {
        json
      }
      reason {
        json
      }
      versionDeprecated
      versionRetired
    }
  }`;

  try {
    const result = await logRequest(
      async () => graphqlResults(query, ttlSeconds), 
      'getDeprecations'
    );

    if (result?.errors && result.errors.length > 0) {
      console.error('GraphQL errors in getDeprecations:', result.errors);
      throw new Error(result.errors[0].message);
    }

    const deprecations = result?.data?.DeprecationCollection || [];
    console.log('deprecations:', deprecations);
    return deprecations;
  } catch (error) {
    console.error(`Error fetching deprecations: ${error}`);
    return null;
  }
};

export default getDeprecations;
