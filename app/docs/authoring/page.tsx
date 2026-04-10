import type { Metadata } from "next";
import { PersonaLandingPage } from "@/components/persona-landing/PersonaLandingPage";

const hostname = "https://dev.dotcms.com";

export const metadata: Metadata = {
    title: "Content teams",
    description:
        "Introductory hub for editors and marketers: Universal Visual Editor, pages, personalization, governance, and visual editing.",
    alternates: {
        canonical: `${hostname}/docs/authoring`,
    },
    openGraph: {
        title: "Content teams | dotCMS Docs",
        description:
            "UVE, page building, personalization, workflows, and content best practices on dotCMS.",
        url: `${hostname}/docs/authoring`,
        siteName: "dotCMS Docs",
        locale: "en_US",
        type: "website",
    },
};

export default function AuthoringPersonaPage() {
    return <PersonaLandingPage personaId="authoring" />;
}
