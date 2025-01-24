export type TContentItem = {
  type: string;
  content?: TContentItem[];
  attrs?: {
    textAlign?: string;
    level?: number;
    src?: string;
    alt?: string;
    title?: string;
    href?: string | null;
    target?: string | null;
    data?: {
      identifier?: string;
      languageId?: number;
    };
  };
  marks?: Array<{
    type: string;
    attrs?: {
      href?: string;
      target?: string;
      rel?: string;
      class?: string | null;
    };
  }>;
}

export type TAuthor = {
  identifier: string;
  name?: string;
}

export type TCategory = {
  name: string;
  description?: string;
}

export type TRecommendBlogResponse = {
  showInListing: string;
  publishDate: string;
  body_raw: string;
  body: TContentItem;
  postingDate: string;
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
  categories: TCategory[];
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
  author: TAuthor[];
}

export type TGetRecommendBlogPostContents = {
  categories?: Array<{ [key: string]: string }> | null;
}