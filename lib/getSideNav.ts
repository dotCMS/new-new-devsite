const GRAPHQL_ENPOINT = `/api/v1/graphql`

export const getSideNav = async () => {
    const query = `
    query Documents {
        DotcmsDocumentationCollection(query: "+DotcmsDocumentation.urlTitle_dotraw:table-of-contents") {
            title
            urlTitle
            dotcmsdocumentationchildren {
                title
                urlTitle
                dotcmsdocumentationchildren {
                        title
                        urlTitle
                        dotcmsdocumentationchildren {
                            title
                            urlTitle
                            dotcmsdocumentationchildren {
                                title
                                urlTitle
                            }
                    }
                }
            }
        }
    }
    `

    const url = new URL(GRAPHQL_ENPOINT, process.env.NEXT_PUBLIC_DOTCMS_HOST);

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN}`,
            "Content-Type": "application/json",
            "dotcachettl": "0" // Bypasses GraphQL cache
        },
        body: JSON.stringify({ query }),
        cache: "no-cache",
    })

    if (!res.ok) {
        throw new Error('Failed to fetch products')
    }

    const data = await res.json()

    if (data.errors) {
        throw new Error(data.errors[0].message)
    }

    return data.data.DotcmsDocumentationCollection
}
