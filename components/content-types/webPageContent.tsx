import React from 'react';
import { isJSON } from '@/util/utils';
import { DotBlockEditor } from '../shared/dotBlockEditor';
interface WebPageContentProps {
  title: string;
  body: string;
}

const WebPageContent: React.FC<WebPageContentProps> = (contentlet) => {
  const { title, body } = contentlet;

  return (
    <article className="w-full">

      <div className="prose dark:prose-invert max-w-none">
        {isJSON(body) ? (
          <DotBlockEditor
            blocks={typeof body === 'string' ? JSON.parse(body) : body}
            customRenderers={{}}
          />
        ) : (
          <>
            <div dangerouslySetInnerHTML={{ __html: body }} />
          </>
        )}
      </div>
    </article>
  );
};

export default WebPageContent;

