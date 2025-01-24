export type Tsearch = {
  author?: string,
  value?: string
  tag?: string, 
  dates?: [key: string], 
  search?: string
} 

export type TGetSearchFilter = {
  author: string
  limit: string | number
  tag: string
  search: string | Tsearch
  category: string
  collectionType: string
}

export type TContentlet = {
  showInListing?: string;
  show?: string;
  [key: string]: any;
};