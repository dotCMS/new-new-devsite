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
    <div className="prose dark:prose-invert mb-6 sm:mb-8 max-w-none min-w-0 w-full overflow-x-auto break-words whitespace-normal prose-img:max-w-full prose-pre:max-w-full prose-pre:overflow-x-auto">
        <DotBlockEditor blocks={body?.json || body} customRenderers={customRenderers} />
    </div>
  );
}
