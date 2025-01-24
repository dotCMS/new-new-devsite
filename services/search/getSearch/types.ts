import { CSSProperties } from 'react'

export type TContentItem = {
  type: string
  content: {
    type: string
    attrs?: {
      textAlign: CSSProperties['textAlign']
    }
    content: {
      type: string
      text: string
    }[]
  }[]
}

export type Tmacthes = {
  distance?: number
  extractedText?: string
}

export type TGetSearch = {
  currentPage?: number
  searchTerm: string
  aiToken?: string | null
  typeDoc?: boolean
}

export type TdotCMSResults = {
  publishDate: string
  body_raw: string
  postingDate: string
  body: TContentItem
  hostName: string
  modDate: string
  title: string
  baseType: string
  inode: string
  archived: boolean
  showContentAboveChildren: string
  ownerName: string
  host: string
  working: boolean
  tag: string
  locked: boolean
  stInode: string
  contentType: string
  live: boolean
  owner: string
  identifier: string
  urlTitle: string
  seoDescription: string
  publishUserName: string
  documentation: string
  publishUser: string
  languageId: number
  format: string
  URL_MAP_FOR_CONTENT: string
  creationDate: string
  url: string
  titleImage: string
  modUserName: string
  urlMap: string
  hasLiveVersion: boolean
  folder: string
  hasTitleImage: boolean
  sortOrder: number
  modUser: string
  __icon__: string
  contentTypeIcon: string
  variant: string
  matches: Tmacthes[]
}

export type TSearchResult = {
  timeToEmbeddings: string
  total: number
  query: string
  threshold: number
  dotCMSResults: TdotCMSResults[]
  operator: string
  offset: number
  limit: number
  count: number
}
