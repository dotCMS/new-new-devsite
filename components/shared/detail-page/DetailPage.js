'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { CUSTOMER_ACTIONS, initEditor, isInsideEditor, postMessageToEditor } from '@dotcms/client';

import { client } from '@/app/utils/client';

import Contentlet from '@/components/shared/contentlet';
import customRenderers from '@/components/block-editor';
import { NewsletterForm } from '@/components/shared/newsletter-form/NewsletterForm';

import { DetailHeader } from './components/DetailHeader';
import { RelatedPosts } from './components/RelatedPosts';
import { normalizeDetailPageContent } from './utils';
import { DotBlockEditor } from '../decodeTextBlock';

export function DetailPage({ pageAsset, relatedPost, customPageBlocks = customRenderers }) {
    const pathname = usePathname();

    const { urlContentMap = {} } = pageAsset;
    const normalizedContent = normalizeDetailPageContent(urlContentMap);

    const [contentlet, setContentlet] = useState(urlContentMap);
    const [detailContent, setDetailContent] = useState(normalizedContent);

    useEffect(() => {
        if (!isInsideEditor()) {
            return;
        }

        /**
         * Send a message to the editor to let it know that the client is ready.
         * This is a temporary workaround to avoid the editor to be stuck in the loading state.
         * This will be removed once the editor is able to detect when the client is ready without use DotcmsLayoutComponent.
         */
        initEditor({ pathname });
        postMessageToEditor({ action: CUSTOMER_ACTIONS.CLIENT_READY });

        client.editor.on('changes', ({ urlContentMap }) => {
            const normalizedContent = normalizeDetailPageContent(urlContentMap);
            setContentlet(urlContentMap);
            setDetailContent(normalizedContent);
        });
    }, [pathname]);

    return (
        <main className="flex w-full flex-col gap-0">
            <Contentlet contentlet={contentlet}>
                <DetailHeader {...detailContent} />
                <div className="p-4 pt-11 md:p-16 lg:px-32">
                    <div className="container flex gap-6 p-0 lg:gap-9">
                        <article className="prose w-full max-w-fit lg:w-2/3">
                            <DotBlockEditor
                                customRenderers={customPageBlocks}
                                blocks={detailContent.body}
                            />
                        </article>
                        <div className="hidden flex-col gap-16 lg:flex lg:w-1/3">
                            <NewsletterForm />
                        </div>
                    </div>
                </div>
            </Contentlet>
            {!!relatedPost?.length && <RelatedPosts posts={relatedPost} />}
        </main>
    );
}
