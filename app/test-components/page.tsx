'use client'

import MarkdownContent from '@/components/MarkdownContent'

const markdownContent = `
# Block Components Test Page

Demoing the new SwaggerUI-style API endpoint block component:

## API Endpoints

Dropping this component directly into your markdown content:

\`\`\`markdown
\`\` d \'<Endpoint method="GET" path="/api/v1/contenttype" /> \` d \`\`
\`\`\`

\`\`\`markdown
<Endpoint method="GET" path="/api/v1/contenttype" />
\`\`\`

\`<Endpoint method="GET" path="/api/v1/contenttype" />\`

\`<Endpoint method="GET" path="/api/v1/contenttype" />
a\'

\`<Endpoint method="GET" path="/api/v1/contenttype" />\`


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

## Code Examples

Here's how easy it is to use:

\`\`\`markdown
<!-- Basic endpoint (collapsed, read-only) -->
<Endpoint method="GET" path="/api/v1/content" />

<!-- Show the tag/category -->
<Endpoint method="POST" path="/api/v1/content" showTag={true} />

<!-- Enable interactive "Try it out" -->
<Endpoint method="PUT" path="/api/v1/content/{id}" tryItOut={true} />

<!-- Both tag and try it out -->
<Endpoint method="DELETE" path="/api/v1/content/{id}" showTag={true} tryItOut={true} />
\`\`\`

The component automatically:
- Fetches the OpenAPI specification
- Finds the endpoint details
- Renders a complete SwaggerUI-style documentation block
- Starts collapsed and read-only unless configured otherwise
`;

export default function TestComponentsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MarkdownContent content={markdownContent} />
    </div>
  )
} 