export type TSearchCompletions = {
  searchTerm: string
  typeDoc?: boolean
  aiToken?: string | null
  searchLimit?: number
}

export type TChatCompletionChunkResponse = {
  id: string
  object: string
  created: number
  model: string
  system_fingerprint: string | null
  choices: TChatChoice[]
}

export type TChatChoice = {
  index: number
  delta: TChatDelta
  logprobs: any
  finish_reason: string | null
}

export type TChatDelta = {
  content: string
}
