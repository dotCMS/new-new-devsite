/**
 * Persona hub pages: curated doc links and section narratives.
 *
 * `href` values use the same `code` slugs as the docs nav API (`/api/v1/nav/docs/nav`),
 * which resolve to `/docs/{code}` (see `util/navTransform.ts` and QuickSearch in
 * `RedesignedNavTree.tsx`). Align with `components/navigation/fallback.json` when the API
 * is unavailable.
 *
 * Set DOTCMS_NAV_DEBUG=1 to log nav payloads from `getNavSections` / `getSideNav`.
 *
 * Section narratives synthesize `seoDescription` text from the DotcmsDocumentation tree
 * (same GraphQL as `getSideNav`). Reword lightly for flow; update when CMS metadata changes.
 */

export type PersonaId = "developer" | "authoring" | "devops";

export type PersonaLink = {
    label: string;
    href: string;
    external?: boolean;
};

export type PersonaSection = {
    heading: string;
    /**
     * 1–3 short paragraphs, usually synthesized from DotcmsDocumentation `seoDescription` values.
     * Use blank lines (`\\n\\n`) between paragraphs for display.
     */
    narrative: string;
    links: PersonaLink[];
};

export type PersonaDefinition = {
    id: PersonaId;
    title: string;
    /** Hero subtitle */
    tagline: string;
    sections: PersonaSection[];
};

export const PERSONAS: Record<PersonaId, PersonaDefinition> = {
    developer: {
        id: "developer",
        title: "Developers",
        tagline: "Build, integrate, and extend dotCMS with APIs, SDKs, and modern delivery patterns.",
        sections: [
            {
                heading: "dotCMS developer instance",
                narrative:
                    "The dotCMS developer Docker image bundles the services required to run the platform. Under the [Business Source License (BSL)](https://www.dotcms.com/bsl), all features are included — no community vs. enterprise split — and free use is available for individual developers, small businesses, and non-production environments.\n\nDocker configuration pages document environment variables, JVM, database, and search settings you will recognize in production; the dotCMS CLI (dotCLI) is built for driving an instance from the shell in a CI/CD-style workflow.",
                links: [
                    { label: "Developer instance", href: "/docs/dotcms-developer-instance" },
                    { label: "Docker environment configuration", href: "/docs/docker-image-configuration-options" },
                    { label: "dotCLI", href: "/docs/cli" },
                ],
            },
            {
                heading: "API documentation",
                narrative:
                    "The docs describe the full set of REST services dotCMS exposes for integration. Before any call succeeds, users and applications must authenticate — so start with auth, then layer in content reads/writes and media handling.\n\nGraphQL is documented as a way to query the content repository directly. The OpenAPI (“All APIs”) view ties the surface area together when you need to validate payloads or share examples with your team.",
                links: [
                    { label: "API playground (OpenAPI / Swagger UI)", href: "/docs/all-rest-apis" },
                    { label: "REST APIs overview", href: "/docs/rest-apis" },
                    { label: "GraphQL", href: "/docs/graphql" },
                    { label: "Content API CRUD example", href: "/docs/content-api-crud-example" },
                    { label: "Saving Content via API", href: "/docs/save-content" },
                    { label: "REST API authentication", href: "/docs/rest-api-authentication" },
                    { label: "Image processing API", href: "/docs/image-resizing-and-processing" },
                ],
            },
            {
                heading: "Integration guides",
                narrative:
                    "The Headless SDK overview explains that dotCMS ships tools and components to build headless pages with modern frameworks; the example-project docs are written to get you running quickly on Next.js, Angular, Astro, Laravel, Symfony, and more.\n\nPair those with content modeling basics — creating a content type and working with content APIs — so your integration story is end-to-end, not just a starter repo.",
                links: [
                    { label: "Next.js example project", href: "/docs/sdk-nextjs-example" },
                    { label: "Angular example project", href: "/docs/sdk-angular-example" },
                    { label: "Astro example project", href: "/docs/sdk-astro-example" },
                    { label: "Laravel example", href: "/docs/sdk-laravel-example" },
                    { label: "Symfony example", href: "/docs/sdk-symfony-example" },
                    { label: "Creating a content type", href: "/docs/creating-a-content-type" },
                    { label: "Content API (overview)", href: "/docs/content-api" },
                ],
            },
            {
                heading: "SDK Libraries",
                narrative:
                    "The JavaScript client library is documented as the piece that performs API calls securely from a browser app or Node server. React and Angular packages add components and hooks designed to work with dotCMS and the Universal Visual Editor; the Types package adds strong typing for UVE work.\n\nThe UVE library supports in-context editing flows; Experiments covers A/B testing in headless setups; Analytics tracks content-aware events. The PHP SDK (alpha) is positioned for PHP-based site development alongside the same content APIs.",
                links: [
                    { label: "@dotcms/client", href: "/docs/sdk-client-library" },
                    { label: "@dotcms/react", href: "/docs/sdk-react-library" },
                    { label: "@dotcms/angular", href: "/docs/sdk-angular-library" },
                    { label: "@dotcms/uve", href: "/docs/sdk-uve-library" },
                    { label: "@dotcms/types", href: "/docs/sdk-types-library" },
                    { label: "@dotcms/experiments", href: "/docs/sdk-experiments-library" },
                    { label: "@dotcms/analytics", href: "/docs/sdk-analytics-library" },
                    { label: "dotcms/php-sdk (alpha)", href: "/docs/sdk-php-library" },
                ],
            },
            {
                heading: "Universal Visual Editor — headless configuration",
                narrative:
                    "The Universal Visual Editor documentation describes broad page-editing capabilities for both traditional and headless setups. The headless configuration guide focuses on in-context editing for remote sites and apps — where preview, layout, and permissions must line up with your front-end routes.\n\nThe @dotcms/uve SDK page summarizes programmatic support for those same editor flows when your team needs code-level control alongside authoring.",
                links: [
                    { label: "UVE config for headless pages", href: "/docs/uve-headless-config" },
                    { label: "Page editor (UVE)", href: "/docs/universal-visual-editor" },
                    { label: "@dotcms/uve SDK", href: "/docs/sdk-uve-library" },
                ],
            },
            {
                heading: "Native development & Velocity",
                narrative:
                    "Server-side scripting docs position Velocity for templates, custom fields, containers, and content — dynamic sites without shipping Java for every change. Viewtools are described as the extension point Java developers use to expose safe helpers to template authors.\n\nThe Scripting API covers lightweight custom REST endpoints. The Velocity Playground is explicitly for previewing, testing, and debugging templating code before it hits production traffic.",
                links: [
                    { label: "Why Velocity?", href: "/docs/why-velocity" },
                    { label: "Viewtools", href: "/docs/velocity-viewtools" },
                    { label: "Scripting API", href: "/docs/scripting-api" },
                    { label: "Velocity playground", href: "/docs/velocity-playground" },
                    { label: "Velocity User's Guide", href: "/docs/velocity-user-s-guide" },
                    { label: "Velocity Best Practices", href: "/docs/velocity-best-practices" },
                ],
            },
            {
                heading: "GitHub repository",
                narrative:
                    "Contributing-code documentation spells out how community members can suggest fixes, follow coding standards, and use GitHub in the contribution process. The open core remains the anchor for releases, issues, and merge requests when you outgrow what ships in the container image alone.",
                links: [
                    {
                        label: "dotCMS core on GitHub",
                        href: "https://github.com/dotCMS/core",
                        external: true,
                    },
                ],
            },
            {
                heading: "Tutorials and videos",
                narrative:
                    "The Guides & tutorials hub explains how to integrate features step-by-step and get more out of built-in tools. Free on-demand training courses summarize what dotCMS covers in structured video form for onboarding and enablement.\n\nThe table-of-contents page remains the map when you need breadth after you have started from a guide or course. YouTube supplements with informal walkthroughs and announcements.",
                links: [
                    { label: "Technical Blogs", href: "/blog" },
                    { label: "Guides & How-Tos", href: "/learning/listing" },
                    { label: "Free on-demand training (courses)", href: "https://dotcms.talentlms.com/catalog/index", external: true },
                    { label: "We call it the docs Table of Contents, but it's more like a Table of Suggestions", href: "/docs/table-of-contents" },
                    {
                        label: "dotCMS on YouTube",
                        href: "https://www.youtube.com/@dotcms",
                        external: true,
                    },
                ],
            },
        ],
    },
    authoring: {
        id: "authoring",
        title: "Content teams",
        tagline:
            "Author, structure, and optimize experiences with visual tools, governance, and customer-centric workflows.",
        sections: [
            {
                heading: "Universal Visual Editor",
                narrative:
                    "The Universal Visual Editor supports a wide range of page-editing capabilities in both traditional and headless configurations. The headless configuration guide explains in-context editing on remote sites and apps — preview and structure aligned with your delivery stack.\n\nLayout docs cover how content lands in page regions; Future Time Machine supports previewing scheduled and future-dated material when you need to see what visitors will see later. Together, you get both space *and* time.",
                links: [
                    { label: "Page editor (UVE)", href: "/docs/universal-visual-editor" },
                    { label: "UVE config for headless pages", href: "/docs/uve-headless-config" },
                    { label: "Future Time Machine", href: "/docs/future-time-machine" },
                    { label: "Designing Templates and Layouts", href: "/docs/designing-a-template-with-a-theme" },
                ],
            },
            {
                heading: "Content management best practices",
                narrative:
                    "Content types are introduced as the schema you design — think of them as the shape of your content database. Field-type documentation lists every field you can add and how it behaves in forms and APIs.\n\nWorkflow docs cover creating and managing custom schemes and assigning them to types. Push publishing describes moving bundles of objects between servers — including dynamic and static endpoints — when content promotes beyond a single environment.",
                links: [
                    { label: "Working with content types", href: "/docs/content-types" },
                    { label: "Content states and workflows", href: "/docs/managing-workflows" },
                    { label: "Fields and field types", href: "/docs/content-type-fields" },
                    { label: "Field variables", href: "/docs/field-variables" },
                    //{ label: "Multilingual sites and content", href: "/docs/multilingual-sites-and-content" },
                    { label: "Push publishing", href: "/docs/push-publishing" },
                ],
            },
            {
                heading: "Page building and templates",
                narrative:
                    "Templating documentation explains how HTML/XML pages draw on templates and containers to organize and display content. Themes cover creating and managing template assets (including framework choices).\n\nWidgets are documented as reusable dynamic fragments authors can place without writing Velocity. Layouts (under pages/UVE) describe how regions receive content in the visual editor.",
                links: [
                    { label: "Templating", href: "/docs/templating" },
                    { label: "Designing Templates and Layouts", href: "/docs/designing-a-template-with-a-theme" },
                    { label: "Themes", href: "/docs/creating-a-new-theme" },
                    { label: "Widgets", href: "/docs/widgets" },
                ],
            },
            {
                heading: "Personalization tools",
                narrative:
                    "dotCMS personalization tools let you target visitors, personas, and rules. Persona docs walk through defining segments and how they connect to content.\n\nRules documentation covers conditions, actions, and no-code personalization at page or site scope. Experiments describes live A/B tests with performance metrics. Taxonomies and tags explain organizing content with categories and tag fields so segments stay maintainable.",
                links: [
                    { label: "Marketing rules", href: "/docs/rules" },
                    { label: "Personas", href: "/docs/personas" },
                    { label: "A/B testing and experiments", href: "/docs/experiments-and-a-b-testing" },
                    { label: "Categories and tags", href: "/docs/taxonomies-and-tags" },
                ],
            },
            {
                heading: "Site Searches, AI Searches, and Navigation management",
                narrative:
                    "The searching and menus hub ties together how authors find content and how site search is exposed to visitors. Site search documentation covers Elasticsearch-backed discovery in the repository — syntax, catch-all search, and how fields map to indexes. The AI Search blog post walks through setting up an AI-powered search experience for your public site when you want semantic or conversational retrieval on top of your content.\n\nURL maps and SEO-friendly slugs explain readable detail URLs; vanity URLs cover pattern-based redirects and rewrites you manage in the CMS. Navigation management with the NavTool documents building and maintaining menus from content and structure, and the XML sitemap pages describe generating sitemaps so crawlers can discover your published URLs.",
                links: [
                    { label: "Searching & menus", href: "/docs/search" },
                    { label: "Site Search", href: "/docs/site-search" },
                    { label: "AI Search", href: "/blog/set-up-an-ai-powered-search-for-your-site" },
                    { label: "URL maps & slugs", href: "/docs/slugs-and-url-maps-seo-friendly-urls" },
                    { label: "Vanity URLs", href: "/docs/vanity-urls" },
                    { label: "Navigation Management with the NavTool", href: "/docs/navtool-viewtool" },
                    { label: "Generating XML Sitemaps", href: "/docs/xml-sitemap" },
                ],
            },
            {
                heading: "Workflow and governance",
                narrative:
                    "Managing workflows documentation explains creating schemes, steps, actions, and sub-actions — including schedule-enabled flows and task screens for assignees.\n\ndotAI workflow sub-actions are described as combining automation for generation, tagging, translation, and related tasks when your edition includes dotAI.",
                links: [
                    { label: "Content states and workflows", href: "/docs/managing-workflows" },
                    { label: "Workflow sub-actions (a.k.a. actionlets)", href: "/docs/workflow-sub-actions" },
                    { label: "The Workflow tool", href: "/docs/workflow-viewtool" },
                    { label: "Auto-tagging and other AI workflows", href: "/docs/dotai-workflows" },
                ],
            },
            {
                heading: "Visual editing resources",
                narrative:
                    "Authoring-content documentation explains how contributors add and edit content from the Content tool — including searching, importing, versioning, and export options.\n\nAdding and editing content covers permissions-aware editing; relating content explains relationship fields; files and images distinguish standalone assets versus embedded binaries. The dotAI tool page summarizes admin configuration for AI-assisted authoring features.",
                links: [
                    { label: "Content editor", href: "/docs/content-editor" },
                    { label: "Adding content", href: "/docs/adding-and-editing-content" },
                    { label: "Relating content", href: "/docs/relationships" },
                    { label: "Assets and images", href: "/docs/files-and-images" },
                    { label: "AI content generation", href: "/docs/dotai-tool" },
                ],
            },
        ],
    },
    devops: {
        id: "devops",
        title: "DevOps",
        tagline:
            "Deploy, secure, tune, and operate dotCMS reliably across environments and tenants.",
        sections: [
            {
                heading: "Deployment architecture",
                narrative:
                    "Requirements documentation spells out supported platforms, sizing, and prerequisites so you can validate a topology before you deploy. Self-hosting via Docker explains running dotCMS in containers; the Docker environment configuration pages cover image options, environment variables, JVM, database, and search settings you will see in real environments.\n\nManaging Evergreen on-premise documents the dotEvergreen self-hosted path when you want continuous delivery of platform updates on your own infrastructure. Cluster setup walks through auto- and manual-cluster modes for multi-node deployments.",
                links: [
                    { label: "Requirements", href: "/docs/requirements" },
                    { label: "Self-hosting via Docker", href: "/docs/docker" },
                    { label: "Docker environment configuration", href: "/docs/docker-image-configuration-options" },
                    { label: "Self-hosting dotEvergreen", href: "/docs/managing-evergreen-on-premise" },
                    { label: "Cluster setup", href: "/docs/cluster-setup" },
                ],
            },
            {
                heading: "Configuration and setup guides",
                narrative:
                    "Configuration properties documentation explains how to customize system behavior from the central properties file. Locales and language configuration pages describe multilingual setups and fallbacks.\n\nApps integrations covers third-party app bindings (where SAML secrets, CDNs, and similar live). dotAI’s overview states that it exposes OpenAI-powered operations across sites and apps — with linked pages for workflow actions, REST resources, admin tooling, and the MCP server for advanced AI integration.",
                links: [
                    { label: "Configuration properties", href: "/docs/configuration-properties" },
                    { label: "Locales & localization", href: "/docs/locales" },
                    { label: "Apps integrations", href: "/docs/apps-integrations" },
                    { label: "AI tools setup", href: "/docs/dotai" },
                    { label: "MCP server (dotAI companion)", href: "/docs/mcp-server" },
                ],
            },
            {
                heading: "Security and compliance",
                narrative:
                    "SAML documentation covers enterprise SSO integration; assigning permissions and roles-and-tools pages explain how access maps to CMS features. User management discusses front-end versus back-end accounts.\n\nKnown security issues lists advisories; responsible disclosure states how to report defects; security best practices summarizes platform-hardening expectations. Together they give operators a checklist for audits and customer security reviews.",
                links: [
                    { label: "SAML / SSO", href: "/docs/saml-authentication" },
                    { label: "Assigning permissions", href: "/docs/assigning-permissions" },
                    { label: "Roles & tools", href: "/docs/roles-and-tools" },
                    { label: "User management", href: "/docs/user-management" },
                    { label: "Known security issues", href: "/docs/known-security-issues" },
                    { label: "Responsible disclosure policy", href: "/docs/responsible-disclosure-policy" },
                    { label: "Security best practices", href: "/docs/security-best-practices" },
                ],
            },
            {
                heading: "Performance optimization",
                narrative:
                    "Performance tuning is the umbrella for JVM, database, cache, logging, and profiling levers — memory settings, cache regions and providers (including chaining and Redis), and how to observe the system under load. Docker performance considerations call out container-specific sizing, storage, and runtime choices that affect throughput and latency.\n\nCache configuration explains how regions and providers are wired; cache tuning goes deeper on eviction, TTLs, and getting the most from your cache stack. Load balancing documentation covers distributing traffic across nodes so clusters stay responsive as you scale out.",
                links: [
                    { label: "Performance tuning", href: "/docs/performance-tuning" },
                    { label: "Docker performance considerations", href: "/docs/docker-performance-considerations" },
                    { label: "Cache configuration", href: "/docs/cache-configuration" },
                    { label: "Cache tuning", href: "/docs/cache-tuning" },
                    { label: "Load balancing", href: "/docs/load-balancing" },
                ],
            },
            {
                heading: "Multi-site and multi-tenant management",
                narrative:
                    "Multi-site management explains how to run many hostnames and sites from one dotCMS instance — adding and copying sites, dashboards, host metadata, and day-to-day operations across your fleet.\n\nSite permissions document how access is scoped per site so teams and tenants stay isolated when they share infrastructure. Site variables cover per-site configuration values you can reference from templates and code without hard-coding environment-specific details.",
                links: [
                    { label: "Multi-site management", href: "/docs/multi-site-management" },
                    { label: "Site Permissions", href: "/docs/site-permissions" },
                    { label: "Site Variables", href: "/docs/site-variables" },
                ],
            },
            {
                heading: "Monitoring and maintenance",
                narrative:
                    "System maintenance covers operational hygiene — cache flushing, index management and reindexing, log review, and utilities such as search-and-replace or trimming old asset versions. System info surfaces runtime and environment details; threads documentation helps you inspect what the JVM is doing when you need to correlate load with behavior.\n\nChangelogs summarize what changed release by release. Current releases list the shipping artifacts you should run in production. Upgrading ties those notes to step-by-step migration work so you can plan maintenance windows with clear before-and-after expectations.",
                links: [
                    { label: "System maintenance", href: "/docs/maintenance" },
                    { label: "System info", href: "/docs/system-info" },
                    { label: "Threads", href: "/docs/threads" },
                    { label: "Changelogs", href: "/docs/changelogs" },
                    { label: "Current releases", href: "/docs/current-releases" },
                    { label: "Upgrading", href: "/docs/upgrading-dotcms" },
                ],
            },
        ],
    },
};
