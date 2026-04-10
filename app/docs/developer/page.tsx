import type { Metadata } from "next";
import { PersonaLandingPage } from "@/components/persona-landing/PersonaLandingPage";

const hostname = "https://dev.dotcms.com";

export const metadata: Metadata = {
    title: "Developers",
    description:
        "A curated starting point for engineers: APIs, SDKs, UVE, integrations, and the dotCMS developer workflow.",
    alternates: {
        canonical: `${hostname}/docs/developer`,
    },
    openGraph: {
        title: "Developers | dotCMS Docs",
        description:
            "APIs, SDKs, Universal Visual Editor, and integration resources for dotCMS developers.",
        url: `${hostname}/docs/developer`,
        siteName: "dotCMS Docs",
        locale: "en_US",
        type: "website",
    },
};

export default function DeveloperPersonaPage() {
    return <PersonaLandingPage personaId="developer" />;
}
