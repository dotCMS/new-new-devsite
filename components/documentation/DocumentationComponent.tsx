"use client";


import MarkdownContent from "@/components/MarkdownContent";
import Warn from "../mdx/Warn";

function cleanMarkdown(markdownString: string, identifierString: string) {
  return markdownString
    .replaceAll("${docImage}", "/dA/" + identifierString + "/diagram")
    .replaceAll(
      'src="/contentAsset',
      'src="https://www.dotcms.com/contentAsset'
    )
    .replaceAll("(/dA/", "(https://www.dotcms.com/dA/")
    .replaceAll("( /dA/", "(https://www.dotcms.com/dA/")
    .replaceAll('src="/dA/', 'src="https://www.dotcms.com/dA/')
    .replaceAll("(/contentAsset", "(https://www.dotcms.com/contentAsset")
    .replaceAll("( /contentAsset", "(https://www.dotcms.com/contentAsset")
    .replaceAll("</br>", "<br>");
}

export default function DocumentationComponent(contentlet: any ) {

  if (!contentlet ) {
    return <div>Loading...</div>;
  }

  const documentation = cleanMarkdown(
    contentlet.documentation,
    contentlet.identifier
  );

  return (
    <>
      <div className="markdown-content">
        {contentlet.tag.includes("deprecated") && (
          <div className="mb-6">
            <Warn>This function has been deprecated.</Warn>
          </div>
        )}
        <MarkdownContent content={documentation} />
      </div>
    </>
  );
};

