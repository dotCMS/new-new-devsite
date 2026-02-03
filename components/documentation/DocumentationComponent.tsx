"use client";


import MarkdownContent from "@/components/MarkdownContent";
import Warn from "../mdx/Warn";

function cleanMarkdown(markdownString: string | undefined | null, identifierString: string) {
  if (!markdownString) {
    return "";
  }
  return markdownString
    .replaceAll("${docImage}", "/dA/" + identifierString + "/diagram")
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
        {contentlet.tag && Array.isArray(contentlet.tag) && contentlet.tag.includes("deprecated") && (
          <div className="mb-6">
            <Warn>This function has been deprecated.</Warn>
          </div>
        )}
        <MarkdownContent content={documentation} />
      </div>
    </>
  );
};

