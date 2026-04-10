import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ExternalLink, ChevronRight, Home } from "lucide-react";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import RedesignedNavTree from "@/components/navigation/RedesignedNavTree";
import { getNavSections } from "@/services/docs/getNavSections";
import { getSideNav } from "@/services/docs/getSideNav";
import { cn } from "@/util/utils";
import { PERSONAS, type PersonaId } from "./persona-data";

/**
 * Lightweight inline markdown for narrative text.
 * Supports links, bold, italic, and code — no block elements.
 */
function NarrativeMarkdown({ children }: { children: string }) {
    return (
        <ReactMarkdown
            allowedElements={["a", "strong", "em", "code", "p"]}
            unwrapDisallowed
            components={{
                p: ({ children }) => <>{children}</>,
                a: ({ href, children }) => {
                    const isExternal = href?.startsWith("http://") || href?.startsWith("https://");
                    return (
                        <Link
                            href={href || "#"}
                            className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary/60"
                            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                            {children}
                        </Link>
                    );
                },
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                em: ({ children }) => <em>{children}</em>,
                code: ({ children }) => (
                    <code className="rounded bg-muted px-1 py-0.5 text-sm font-mono">{children}</code>
                ),
            }}
        >
            {children}
        </ReactMarkdown>
    );
}

/** Brand tints (Figma primary/secondary) — hero blobs only, low opacity. */
const HERO_BLOBS: Record<PersonaId, { a: string; b: string }> = {
    developer: {
        a: "bg-[#181B6D]/[0.14] dark:bg-[#8C8DB6]/[0.18]",
        b: "bg-[#1EC6F5]/[0.1] dark:bg-[#61D7F8]/[0.12]",
    },
    authoring: {
        a: "bg-[#5EC115]/[0.11] dark:bg-[#8ED35B]/[0.14]",
        b: "bg-[#F5C20A]/[0.08] dark:bg-[#F8D453]/[0.1]",
    },
    devops: {
        a: "bg-[#F05B1C]/[0.11] dark:bg-[#F58C60]/[0.14]",
        b: "bg-[#181B6D]/[0.1] dark:bg-[#5D5F99]/[0.16]",
    },
};

/** 24×24 dot grid, currentColor — sits under hero text. */
const DOT_GRID =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1' cy='1' r='0.65' fill='%23000' fill-opacity='0.06'/%3E%3C/svg%3E\")";

const DOT_GRID_DARK =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1' cy='1' r='0.65' fill='%23fff' fill-opacity='0.05'/%3E%3C/svg%3E\")";

type Props = {
    personaId: PersonaId;
};

export async function PersonaLandingPage({ personaId }: Props) {
    const persona = PERSONAS[personaId];
    const [sideNav, navSections] = await Promise.all([
        getSideNav(),
        getNavSections({ path: "/docs/nav", depth: 4, languageId: 1, ttlSeconds: 600 }),
    ]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header
                sideNavItems={sideNav[0]?.dotcmsdocumentationchildren || []}
                currentPath={personaId}
                navSections={navSections}
            />

            <div className="flex-1">
                <div className="flex flex-col lg:flex-row container mx-auto px-0">
                    <div className="hidden lg:block w-72 shrink-0">
                        <RedesignedNavTree
                            currentPath={personaId}
                            items={sideNav[0]?.dotcmsdocumentationchildren || []}
                            initialSections={navSections}
                        />
                    </div>

                    <main className="flex-1 min-w-0 px-6 sm:px-8 lg:pl-10 lg:pr-12 pb-20">
                        <nav
                            aria-label="Breadcrumb"
                            className="pt-8 pb-6 flex flex-wrap items-center gap-1.5 text-xs font-medium leading-[18px] text-muted-foreground md:text-sm md:leading-5"
                        >
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                            >
                                <Home className="h-4 w-4" aria-hidden />
                                <span className="sr-only">Home</span>
                            </Link>
                            <ChevronRight className="h-4 w-4 opacity-60" aria-hidden />
                            <Link href="/docs/table-of-contents" className="hover:text-foreground transition-colors">
                                Documentation
                            </Link>
                            <ChevronRight className="h-4 w-4 opacity-60" aria-hidden />
                            <span className="font-medium text-foreground">{persona.title}</span>
                        </nav>

                        <header className="relative isolate mb-12 max-w-3xl overflow-hidden rounded-lg border border-border/70 bg-muted/20 dark:bg-muted/10">
                            {/* Soft color fields — hero only */}
                            <div
                                className={cn(
                                    "pointer-events-none absolute -right-20 -top-28 h-[22rem] w-[22rem] rounded-full blur-3xl",
                                    HERO_BLOBS[personaId].a
                                )}
                                aria-hidden
                            />
                            <div
                                className={cn(
                                    "pointer-events-none absolute -bottom-24 -left-16 h-[16rem] w-[16rem] rounded-full blur-3xl",
                                    HERO_BLOBS[personaId].b
                                )}
                                aria-hidden
                            />
                            {/* Light grid; dark mode uses a separate asset so dots stay subtle */}
                            <div
                                className="pointer-events-none absolute inset-0 dark:hidden opacity-[0.55]"
                                style={{ backgroundImage: DOT_GRID }}
                                aria-hidden
                            />
                            <div
                                className="pointer-events-none absolute inset-0 hidden dark:block opacity-[0.45]"
                                style={{ backgroundImage: DOT_GRID_DARK }}
                                aria-hidden
                            />
                            {/* Thin arc — breaks the rectangle without a heavy “hero card” feel */}
                            <svg
                                className="pointer-events-none absolute right-0 top-0 h-40 w-40 text-foreground/[0.04] dark:text-foreground/[0.07]"
                                viewBox="0 0 160 160"
                                fill="none"
                                aria-hidden
                            >
                                <path
                                    d="M120 8c32 28 40 72 24 108-18 42-62 64-108 52"
                                    stroke="currentColor"
                                    strokeWidth="1.25"
                                />
                                <path
                                    d="M132 28c22 20 30 52 18 78-14 32-46 48-82 40"
                                    stroke="currentColor"
                                    strokeWidth="0.75"
                                    opacity="0.6"
                                />
                            </svg>

                            <div className="relative px-6 py-8 md:px-8 md:py-12">
                                {/* Figma primary Fuchsia — thin rule, hero only */}
                                <div className="mb-6 h-px w-16 bg-gradient-to-r from-[#B222D3]/55 to-transparent dark:from-[#C964E0]/45" />
                                {/* H1 XL — Inter Semi Bold 600 (body uses Inter from root layout) */}
                                <h1
                                    className="mb-6 text-[36px] font-semibold leading-[40px] tracking-[-1px] text-foreground md:text-[56px] md:leading-[60px] md:tracking-[-2.5px] lg:text-[64px] lg:leading-[68px] lg:tracking-[-3px]"
                                >
                                    {persona.title}
                                </h1>
                                {/* P XL — Inter Regular 400 */}
                                <p className="max-w-2xl text-[18px] font-normal leading-[28px] text-muted-foreground md:leading-[26px] lg:text-[20px] lg:leading-[28px]">
                                    {persona.tagline}
                                </p>
                            </div>
                        </header>

                        <div className="max-w-3xl divide-y divide-border">
                            {persona.sections.map((section) => (
                                <section key={section.heading} className="py-12">
                                    {/* H2–H3 XL — Inter Semi Bold 600 */}
                                    <h2 className="mb-6 text-[28px] font-semibold leading-[32px] tracking-[-0.5px] text-foreground md:text-[36px] md:leading-[40px] md:tracking-[-1px] lg:text-[40px] lg:leading-[44px] lg:tracking-[-1.5px]">
                                        {section.heading}
                                    </h2>
                                    {/* P — Inter Regular 400 */}
                                    <div className="mb-8 max-w-2xl space-y-4 text-[16px] font-normal leading-6 text-muted-foreground lg:text-[18px] lg:leading-[28px]">
                                        {section.narrative
                                            .split(/\n\n+/)
                                            .map((p) => p.trim())
                                            .filter(Boolean)
                                            .map((paragraph, i) => (
                                                <p key={i}>
                                                    <NarrativeMarkdown>{paragraph}</NarrativeMarkdown>
                                                </p>
                                            ))}
                                    </div>
                                    {/* P SM — Inter Regular 400 */}
                                    <ul className="max-w-2xl space-y-3">
                                        {section.links.map((link) => {
                                            const isExternal = Boolean(link.external);
                                            return (
                                                <li key={`${link.href}-${link.label}`}>
                                                    <Link
                                                        href={link.href}
                                                        className={cn(
                                                            "group inline-flex items-baseline gap-2 text-[14px] font-normal leading-5 underline decoration-foreground/20 underline-offset-[5px] md:leading-[22px] lg:text-[16px] lg:leading-6",
                                                            "text-foreground hover:decoration-foreground/55"
                                                        )}
                                                        {...(isExternal
                                                            ? { target: "_blank", rel: "noopener noreferrer" }
                                                            : {})}
                                                    >
                                                        <span>{link.label}</span>
                                                        {isExternal ? (
                                                            <ExternalLink
                                                                className="h-3.5 w-3.5 shrink-0 translate-y-px opacity-55 group-hover:opacity-90"
                                                                aria-hidden
                                                            />
                                                        ) : null}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
}
