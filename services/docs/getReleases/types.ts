export type TReleaseNotes = {
  releasedDate: string
  eolDate: string
  minor: string
  publishDate: string
  breakingchange: string
  inode: string
  showInChangeLog: boolean
  download: number
  releaseNotes: string
  host: string
  locked: boolean
  stInode: string
  contentType: string
  released: boolean
  identifier: string
  publishUserName: string
  publishUser: string
  creationDate: string
  tags: string
  folder: string
  hasTitleImage: boolean
  sortOrder: number
  hostName: string
  modDate: string
  dockerImage: string
  title: string
  baseType: string
  archived: boolean
  ownerName: string
  working: boolean
  live: boolean
  owner: string
  starter: string
  languageId: number
  lts: number
  url: string
  titleImage: string
  modUserName: string
  hasLiveVersion: boolean
  modUser: string
  __icon__: string
  contentTypeIcon: string
  variant: string
}


export enum FilterReleases {
    ALL,
    CURRENT,
    LTS
  }