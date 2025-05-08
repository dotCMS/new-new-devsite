import React from 'react';
import { isJSON } from '@/util/utils';
import { DotBlockEditor } from '@/components/shared/dotBlockEditor';
interface WebPageContentProps {
  title: string;
  body: string;
}

const WebPageContent: React.FC<WebPageContentProps> = ({ title, body }) => {
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

