//import { BlockEditorRenderer } from '@dotcms/react';
import { ContentNode } from '@dotcms/react';
//import { Block } from '@dotcms/react';

type Block = {
    content?: ContentNode[]
}

export type TDeprecation = {
    title?: string
    dateDeprecated?: string
    dateRetired?: string
    timeframeNote?: string
    docLink?: string
    additionalLinks?: string
    recommendation?: Block
    recLink?: string
    reason?: Block
    versionDeprecated?: string
    versionRetired?: string
}

export type TDeprecationCards = {
    items?: TDeprecation[]
}