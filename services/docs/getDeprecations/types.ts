//import { BlockEditorRenderer } from '@dotcms/react';
import { ContentNode } from '@dotcms/react';
//import { Block } from '@dotcms/react';

type Block = {
    content?: ContentNode[]
}

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