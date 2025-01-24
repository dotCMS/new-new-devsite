

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

    const ES_ENPOINT = process.env.NEXT_PUBLIC_DOTCMS_HOST + "/api/es/raw";


    const query = getTagQuery(luceneQuery, limit);
    //console.log("query", query);

    const res = await fetch(ES_ENPOINT, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN}`,
            "Content-Type": "application/json",
    
        },
        body:  query ,
        cache: "no-cache",
    });
    if (!res.ok) {
        throw new Error('Failed to fetch tags:' + res.status)
    }
    
    const data = await res.json()
    
    if (data.errors) {
        throw new Error(data.errors[0].message)
    }

    return data.aggregations["sterms#tag"].buckets;
}