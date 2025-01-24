import { CSSProperties } from 'react'

export type TContent = {
  type: string
  attrs: {
    textAlign: CSSProperties['textAlign']
  }
  content: TContent[]
}

export type TLanguage = {
  languageId: number
  language: string
  languageCode: string
  country: string
  countryCode: string
  languageFlag: string
  isoCode: string
  id: number
}

export type TcallToAction = {
  publishDate: string
  language: TLanguage
  inode: string
  host: string
  locked: boolean
  stInode: string
  contentType: string
  identifier: string
  publishUserName: string
  publishUser: string
  creationDate: string
  folder: string
  hasTitleImage: boolean
  sortOrder: number
  hostName: string
  modDate: string
  title: string
  baseType: string
  archived: boolean
  buttonType: 'primary' | 'secondary' | 'link'
  ownerName: string
  working: boolean
  live: boolean
  owner: string
  languageId: number
  url: string
  titleImage: string
  modUserName: string
  hasLiveVersion: boolean
  modUser: string
  __icon__: string
  contentTypeIcon: string
  variant: string
}

export type TBlogBanner = {
  publishDate: string
  inode: string
  host: string
  locked: boolean
  stInode: string
  subheading: {
    type: string
    content: TContent[]
  }
  contentType: string
  identifier: string
  image: string
  preheading: string
  publishUserName: string
  publishUser: string
  heading_raw: string
  creationDate: string
  folder: string
  hasTitleImage: boolean
  sortOrder: number
  style: string
  hostName: string
  modDate: string
  title: string
  baseType: string
  archived: boolean
  ownerName: string
  working: boolean
  live: boolean
  owner: string
  heading: {
    type: string
    content: TContent[]
  }
  languageId: number
  subheading_raw: string
  url: string
  layout: string
  titleImage: string
  modUserName: string
  hasLiveVersion: boolean
  modUser: string
  __icon__: string
  contentTypeIcon: string
  variant: string
  callToAction: TcallToAction[]
}
