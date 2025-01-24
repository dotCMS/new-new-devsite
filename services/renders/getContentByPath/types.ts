export type TSearchParams = {
  language_id?: number
  personaId?: string
  mode?: 'EDIT_MODE' | 'PREVIEW_MODE' | 'LIVE_MODE';
}

export type TQuery = {
  tag?: string[] | string
  search?: string
  page?: number
  pagefilter?: number
  category?: string
  authorFilter?: string
  dateFilter?: string
  topicFilter?: string
}

export type TGetContentParams = {
  query?: TQuery | undefined
  params: { slug: string }
  searchParams?: { [key: string]: string | string[] | undefined } | TSearchParams
  path?: string
}
