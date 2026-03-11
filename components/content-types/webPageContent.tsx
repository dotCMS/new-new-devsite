import React from 'react';
import { isJSON } from '@/util/utils';
import { DotBlockEditor } from '../shared/dotBlockEditor';
interface WebPageContentProps {
  title?: string;
  body?: string | { json?: string; content?: unknown[] };
}

const WebPageContent: React.FC<WebPageContentProps> = (contentlet) => {
  const { title, body } = contentlet;
  const raw = (body as any)?.json ?? body;
  const blocks = typeof raw === "string" && isJSON(raw) ? JSON.parse(raw) : raw;

  return (
    <article className="w-full">
      <div className="prose dark:prose-invert max-w-none">
        {blocks?.content != null ? (
          <DotBlockEditor blocks={blocks} customRenderers={{}} />
        ) : typeof body === "string" ? (
          <div dangerouslySetInnerHTML={{ __html: body }} />
        ) : null}
      </div>
    </article>
  );
};

export default WebPageContent;

