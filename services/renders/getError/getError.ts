import dotClient from '@/services/dotcmsClient';
import type { TErrorObject, TErrorContentlet } from './types';
import { logRequest } from '@/utils/logRequest';

const ERROR_CASES: Record<number | string, string> = {
    404: "7699458ade8f19a03f7513e79fe2c46d",
    default: "5af87d4df140ca3b2b2ce6fef289464d",
};

export const getError = async (error: TErrorObject): Promise<TErrorContentlet['contentlets'][0] | undefined> => {
    let errorContentlet: TErrorContentlet = {
        contentlets: [],
    };

    try {
        const queryId = ERROR_CASES[error.status] ?? ERROR_CASES.default;

        errorContentlet = await logRequest(() =>
            dotClient.content
                .getCollection("PageError")
                .query(`+identifier:${queryId}`),
            'getError'
        );

        if (!errorContentlet) {
            console.error('Failed to fetch error contentlet.');
        } else {
            console.log('Fetched error contentlet successfully:', errorContentlet);
        }
    } catch (err) {
        console.error("Error fetching error contentlet", err); 
    }

    return errorContentlet.contentlets[0];
};
