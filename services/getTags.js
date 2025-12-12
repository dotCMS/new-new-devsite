import { Config } from "@/util/config";
import { logRequest } from "../util/logRequest";


function getTagQuery(query, limit) {

    query=query.toLowerCase();

    return `{
        "query" : {
            "query_string" : 
            {
                "query" : "${query}"
            } 
        },
        "aggs" : {
            "tag" : {
                "terms" : {
                    "field" : "tags",
                    "size" : ${limit}  
                }
            }
        },
        "size":0  
    }`

}

export async function getTagsSync(luceneQuery, limit) {
    return await getTagsByLuceneQuery(luceneQuery, limit);
}

export async function getTagsByLuceneQuery(luceneQuery, limit) {

    const ES_ENPOINT = `${Config.DotCMSHost}/api/es/raw`;

    if (luceneQuery.includes("\n")) {
        luceneQuery = luceneQuery.replace(/\n/g, " ");
    }

    luceneQuery = luceneQuery.replace("/", "\\\\/");

    const query = getTagQuery(luceneQuery, limit);
    
    console.log("query", query)

    const res = await logRequest(async () => await fetch(ES_ENPOINT, {
        method: 'POST',
        headers: Config.Headers,
        body:  query ,
    }), "getTags");
    if (!res.ok) {
        throw new Error('Failed to fetch tags:' + res.status)
    }
    
    const data = await res.json()
    
    if (data.errors) {
        throw new Error(data.errors[0].message)
    }

    return data.aggregations["sterms#tag"].buckets;
}