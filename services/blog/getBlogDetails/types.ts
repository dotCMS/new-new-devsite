export type TBlogBodyContent = {
  type: string;
  attrs?: Record<string, any>;
  content?: TBlogBodyContent[];
}

export type TBlogDetailsResponse = {
  showInListing: string;
  publishDate: string;
  body_raw: string;
  body: {
    type: string;
    content: TBlogBodyContent[];
  };
  inode: string;
  host: string;
  locked: boolean;
  stInode: string;
  contentType: string;
  sitemap: string;
  identifier: string;
  image: string;
  urlTitle: string;
  publishUserName: string;
  publishUser: string;
  creationDate: string;
  tags: string;
  sitemapImportance: string;
  folder: string;
  hasTitleImage: boolean;
  sortOrder: number;
  hostName: string;
  modDate: string;
  title: string;
  baseType: string;
  archived: boolean;
  ownerName: string;
  working: boolean;
  live: boolean;
  owner: string;
  languageId: number;
  URL_MAP_FOR_CONTENT: string;
  url: string;
  titleImage: string;
  modUserName: string;
  urlMap: string;
  hasLiveVersion: boolean;
  modUser: string;
  teaser: string;
  __icon__: string;
  contentTypeIcon: string;
  variant: string;
  author: string[];
}

export type TGetBlogDetails = {
  urlmap: string
}
