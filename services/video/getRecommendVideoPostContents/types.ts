export type TGetRecommendVideoPostContents = {
    categories: Array<{ [key: string]: string }> | null;
}

export type TAssetMetaData = {
    modDate: number;
    sha256: string;
    length: number;
    title: string;
    editableAsText: boolean;
    version: number;
    isImage: boolean;
    fileSize: number;
    name: string;
    width: number;
    contentType: string;
    height: number;
  }
  
  export type TRecommendVideoResponse = {
    publishDate: string;
    assetContentAsset: string;
    mimeType: string;
    type: string;
    inode: string;
    path: string;
    host: string;
    locked: boolean;
    stInode: string;
    contentType: string;
    identifier: string;
    publishUserName: string;
    publishUser: string;
    __icon__: string;
    creationDate: string;
    description_raw: string;
    tags: string;
    folder: string;
    size: number;
    hasTitleImage: boolean;
    sortOrder: number;
    name: string;
    hostName: string;
    modDate: string;
    extension: string;
    show: string;
    description: {
      type: string;
      attrs: { [key: string]: any };
      content: Array<{ [key: string]: any }>;
    };
    title: string;
    baseType: string;
    archived: boolean;
    ownerName: string;
    working: boolean;
    categories: Array<{ [key: string]: any }>;
    live: boolean;
    owner: string;
    isContentlet: boolean;
    languageId: number;
    statusIcons: string;
    url: string;
    titleImage: string;
    modUserName: string;
    hasLiveVersion: boolean;
    modUser: string;
    assetVersion: string;
    assetMetaData: TAssetMetaData;
    asset: string;
    contentTypeIcon: string;
    variant: string;
    author: any[];
  }