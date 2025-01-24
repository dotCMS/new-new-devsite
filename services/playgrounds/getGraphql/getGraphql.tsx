import { configGraphql } from './config';
import { type TGraphQLP } from './types';
import { logRequest } from '@/util/logRequest';

export const getGraphql = async (graphQLParams: TGraphQLP) => {
  try {
    const response = await logRequest(() =>
      fetch(`${configGraphql}graphql`, {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphQLParams),
      }), 'getGraphql'
    );

    if (!response) {
      throw new Error('No response received from GraphQL fetch');
    }

    return response.json();
  } catch (e) {
    console.error("Error fetching data: ", e);
    return { errors: [{ message: "Error fetching data" }] };
  }
};
