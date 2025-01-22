'use client';

import { useEffect, useState } from 'react';
import { isInsideEditor as isInsideEditorFn } from '@dotcms/client';

function Contentlet({ contentlet, children }) {
    const [isInsideEditor, setIsInsideEditor] = useState(false);

    useEffect(() => {
        setIsInsideEditor(isInsideEditorFn());
    }, []);

    if (!contentlet || !isInsideEditor) {
        return children;
    }

    return (
        <div
            data-dot-object="contentlet"
            data-dot-identifier={contentlet.identifier}
            data-dot-basetype={contentlet.baseType}
            data-dot-title={contentlet.widgetTitle || contentlet.title}
            data-dot-inode={contentlet.inode}
            data-dot-type={contentlet.contentType}
            data-dot-on-number-of-pages={contentlet.onNumberOfPages ?? 0}
            key={contentlet.identifier}>
            {children}
        </div>
    );
}

export default Contentlet;
