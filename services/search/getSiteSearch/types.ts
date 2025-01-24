export type TReference = {
  contentType: string
  description: string
  matches: number
  score: number
  title: string
  uri: string
}

export type TSearchResult = {
  query: string
  references: TReference[]
  totalHits?: number
}

export type TSiteSearh = {
  searchTerm: string
  searchPlace?: string
  isAllSourcesSearch?: boolean
  currentPage?: number
}
