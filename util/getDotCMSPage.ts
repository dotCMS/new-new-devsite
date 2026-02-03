import { cache } from "react";
import { client } from "./dotcmsClient";

export const getDotCMSPage = cache(async (path: string) => {
    try {
        const pageData = await client.page.get(path, {
            graphql: {
                page: `
                    _map
                    urlContentMap {
                        _map
                        identifier
                        modDate
                        publishDate
                        creationDate
                        title
                        baseType
                        inode
                        archived
                        _map
                        urlMap
                        working
                        locked
                        contentType
                        live
                    }
                    containers {
                        containerContentlets {
                            contentlets { 
                                ... on webPageContent {
                                    _map
                                }
                                ... on DevResource {
                                    _map
                                }
                                ... on DotcmsDocumentation {
                                    _map
                                }
                                ... on RelatedBlogs {
                                    _map
                                }
                                ... on DocumentationHero {
                                    _map
                                    card1 {
                                        _map
                                        title
                                        description
                                        widgetCodeJSON
                                        identifier
                                        url
                                        layout
                                        titleImage {
                                            modDate
                                            sha256
                                            mime
                                            title
                                            versionPath
                                            focalPoint
                                            path
                                            isImage
                                            idPath
                                            size
                                            name
                                            width
                                            height
                                        }
                                    }
                                    card2 {
                                        _map
                                        title
                                        description
                                        widgetCodeJSON
                                        identifier
                                        url
                                        layout
                                        titleImage {
                                            modDate
                                            sha256
                                            mime
                                            title
                                            versionPath
                                            focalPoint
                                            path
                                            isImage
                                            idPath
                                            size
                                            name
                                            width
                                            height
                                        }
                                    }
                                    card3 {
                                        _map
                                        title
                                        description
                                        widgetCodeJSON
                                        identifier
                                        url
                                        layout
                                        titleImage {
                                            modDate
                                            sha256
                                            mime
                                            title
                                            versionPath
                                            focalPoint
                                            path
                                            isImage
                                            idPath
                                            size
                                            name
                                            width
                                            height
                                        }
                                    }
                                }
                                ... on DocumentationLinks {
                                    _map
                                    links {
                                        identifier
                                        url
                                        title
                                        icon {
                                            fileName
                                            sortOrder
                                            description
                                        }
                                    }
                                }
                            }
                        }
                    }
                `
            }
        });

        return pageData;
    } catch (e: any) {
        console.error("ERROR FETCHING PAGE: ", e?.message || e);
        return null;
    }
});

