import type { Metadata } from "next";
import { PersonaLandingPage } from "@/components/persona-landing/PersonaLandingPage";

const hostname = "https://dev.dotcms.com";

export const metadata: Metadata = {
    title: "DevOps",
    description:
        "Operations hub for dotCMS: deployment, security, performance, multi-site management, and maintenance.",
    alternates: {
        canonical: `${hostname}/docs/devops`,
    },
    openGraph: {
        title: "DevOps | dotCMS Docs",
        description:
            "Deploy, secure, tune, and run dotCMS with releases, security advisories, and operational guides.",
        url: `${hostname}/docs/devops`,
        siteName: "dotCMS Docs",
        locale: "en_US",
        type: "website",
    },
};

export default function DevopsPersonaPage() {
    return <PersonaLandingPage personaId="devops" />;
}
