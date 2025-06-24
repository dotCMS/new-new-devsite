import { useEffect, useState } from 'react';
import { client } from '@/util/dotcmsClient';
import { CLIENT_ACTIONS, isInsideEditor, postMessageToEditor } from '@dotcms/client';
import type { PageAsset } from '@/util/page.utils';

interface UsePageAssetProps {
    (currentPageAsset: PageAsset | null): PageAsset | null;
}

export const usePageAsset: UsePageAssetProps = (currentPageAsset) => {
    const [pageAsset, setPageAsset] = useState<PageAsset | null>(null);

    useEffect(() => {
        if (!isInsideEditor()) {
            return;
        }

        const handleChanges = (page: unknown) => {
            if (!page) {
                return;
            }
            setPageAsset(page as PageAsset);
        };

        client.editor.on('changes', handleChanges);

        // If the page is not found, let the editor know
        if (!currentPageAsset) {
            postMessageToEditor({ action: CLIENT_ACTIONS.CLIENT_READY });
            return;
        }

        return () => {
            client.editor.off('changes');
        };
    }, [currentPageAsset]);

    return pageAsset ?? currentPageAsset;
};
