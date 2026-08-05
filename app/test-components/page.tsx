'use client'

import MarkdownContent from '@/components/MarkdownContent'

const markdownContent = `
# Block Components Test Page

Demoing the custom block components capable of being dropped into markdown content:

## API Endpoints

Dropping this component directly into your markdown content:

\`\`\`markdown
<Endpoint method="GET" path="/api/v1/contenttype" />
\`\`\`

Will give this output:

<Endpoint method="GET" path="/api/v1/contenttype" />

And lo, I can put text in between them!

<Endpoint method="POST" path="/api/v1/workflow/steps" />

Also all the **normal *markdown*** stuff [works](https://www.google.com) too!

<Endpoint method="PUT" path="/api/v1/workflow/steps/{stepId}" />

<Endpoint method="DELETE" path="/api/v1/contenttype/id/{idOrVar}" />

<Endpoint method="GET" path="/api/v1/site" />

## Info, Warning boxes

<Info>
The Info component works as expected!
</Info>

<Warn>
And the Warn component too!
</Warn>

## GitHub-style alerts

These are converted into Info/Warn boxes automatically:

> [!NOTE]
> Something worth knowing — maps to Info.

> [!TIP]
> A helpful suggestion — also maps to Info.

> [!IMPORTANT]
> Don't skip this — maps to Warn.

> [!WARNING]
> Be careful — maps to Warn.

> [!CAUTION]
> **Rollback Warning:** This release contains an irreversible change that is non-trivial to rollback from.
> - **Analytics Dashboard**: The dashboard now queries the new domain-driven analytics endpoints. [[#36843](https://github.com/dotCMS/core/issues/36843)]
`;

export default function TestComponentsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MarkdownContent content={markdownContent} />
    </div>
  )
} 