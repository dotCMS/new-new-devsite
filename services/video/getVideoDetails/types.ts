export type TVideoDetailsResponse = {
  [x: string]: { [key: string]: string }[] | null
}

export type TGetVideoDetails = { 
    identifier: string
}