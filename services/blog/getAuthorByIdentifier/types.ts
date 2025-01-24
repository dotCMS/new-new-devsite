import { CSSProperties } from 'react'

export type TImageMetaData = {
  altText?: string
  description?: string
  title?: string
}

export type TLongBioRaw = {
  type: string
  content: {
    type: string
    attrs: {
      textAlign: CSSProperties['textAlign']
    }
  }[]
}

export type TContentlet = {
  lastName: string
  hostName: string
  modDate: string
  imageMetaData?: TImageMetaData
  publishDate: string
  linkedin: string
  title: string
  baseType: string
  inode: string
  archived: boolean
  ownerName: string
  host: string
  working: boolean
  company: string
  locked: boolean
  stInode: string
  contentType: string
  live: boolean
  owner: string
  imageVersion: string
  identifier: string
  image: string
  imageContentAsset: string
  longBio?: object
  publishUserName: string
  publishUser: string
  languageId: number
  creationDate: string
  url: string
  longBio_raw: TLongBioRaw
  titleImage: string
  modUserName: string
  firstName: string
  hasLiveVersion: boolean
  folder: string
  hasTitleImage: boolean
  sortOrder: number
  modUser: string
  __icon__: string
  contentTypeIcon: string
  variant: string
}

export type TAuthor = {
  contentlets: TContentlet[]
  total: number
  page: number
  size: number
}
