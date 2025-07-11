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
`;

export default function TestComponentsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MarkdownContent content={markdownContent} />
    </div>
  )
} 