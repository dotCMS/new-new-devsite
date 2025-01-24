export type TQuery = {
  query: string
  sort: string
  limit: number
  offset: number
}

export type TChangelogItem = {
  minor?: string
  publishDate?: string
  releaseNotes?: string
  dockerImage?: string
  starter?: string
}

export type TApiResponse = {
  entity: {
    jsonObjectView: {
      contentlets: TChangelogItem[]
      totalItems: number
    }
  }
}

export type TLatestMajorLTS = {
  latestLTS?: number
  totalPages?: number
  isLts?: boolean
}
