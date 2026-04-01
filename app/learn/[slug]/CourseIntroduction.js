"use client";

import { DotCMSBlockEditorRenderer } from "@dotcms/react";

/**
 * Block editor must run on the client — @dotcms/react bundles TinyMCE, which breaks
 * when the learn course page is evaluated as a Server Component during `next build`.
 */
export default function CourseIntroduction({ blocks }) {
  return (
    <DotCMSBlockEditorRenderer
      className="prose dark:prose-invert"
      blocks={blocks}
    />
  );
}
