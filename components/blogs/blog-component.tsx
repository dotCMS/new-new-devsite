import { DotBlockEditor } from "@/components/shared/dotBlockEditor";
import React from "react";
export interface BlogProps {
  type1: string;
  title: string;
  body: any;
}
export default function BlogComponent(props: BlogProps) {
    const { body,title,type1 } = props;


  const customRenderers: any = {};

  return (
    <div className="prose dark:prose-invert mb-6 sm:mb-8 break-words whitespace-normal overflow-hidden max-w-none">
        <DotBlockEditor blocks={body?.json || body} customRenderers={customRenderers} />
    </div>
  );
}
