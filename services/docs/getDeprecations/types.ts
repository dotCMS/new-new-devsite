// Block type for block editor content (recommendation and reason fields)
// The actual structure can have a 'json' property or be the block structure directly
type Block = {
    json?: any;
    content?: any[];
    [key: string]: any;
} | any;

type DocLink = {
    title?: string;
    urlTitle?: string;
    tag?: string;
}

export type TDeprecation = {
    identifier?: string;
    title?: string
    dateDeprecated?: string
    dateRetired?: string
    docLinks?: DocLink[];
    timeframeNote?: string
    recommendation?: Block
    recLink?: string
    reason?: Block
    versionDeprecated?: string
    versionRetired?: string
}

export type TDeprecationCards = {
    items?: TDeprecation[]
}