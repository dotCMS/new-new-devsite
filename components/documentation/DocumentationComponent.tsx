"use client";


import MarkdownContent from "@/components/MarkdownContent";
import Warn from "../mdx/Warn";
import { cleanMarkdown } from "./cleanMarkdown";

export default function DocumentationComponent(contentlet: any ) {

  if (!contentlet ) {
    return <div>Loading...</div>;
  }

  const documentation = cleanMarkdown(
    contentlet.documentation,
    contentlet.inode
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

