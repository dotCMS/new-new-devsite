import {
    PenTool,
    Code,
    Server,
    FileText,
    Settings,
    Rocket,
    Database,
    Workflow,
    Shield,
    PlugIcon as Plugin,
    Upload,
    Users,
} from "lucide-react"
import FeatureCard from "./feature-card"

interface Card {
    title: string;
    description: string;
    backgroundImageUrl?: {
        identifier: string;
    };
}

interface HeroProps {
    title: string;
    description: string;
    image1: string;
    image2: string;
    image3: string;
    card1: Card;
    card2: Card;
    card3: Card;
}

export default function Hero(props: HeroProps) {
    const { title, description, card1, card2, card3 } = props;

    const developerLinks = [
        { href: "/docs/rest-api", icon: Code, title: "REST API", color: "[#a21caf]" },
        { href: "/docs/graphql", icon: Database, title: "GraphQL API", color: "[#a21caf]" },
        { href: "/docs/document-service", icon: FileText, title: "Document Service API", color: "[#a21caf]" },
        { href: "/docs/plugin-sdk", icon: Plugin, title: "Plugin SDK", color: "[#a21caf]" },
        { href: "/docs/upgrade", icon: Upload, title: "Upgrade Guide", color: "[#a21caf]" },
    ];

    const authoringLinks = [
        { href: "/docs/content-types", icon: FileText, title: "Content-Types Builder", color: "[#46ad07]" },
        { href: "/docs/content-manager", icon: PenTool, title: "Content Manager", color: "[#46ad07]" },
        { href: "/docs/draft-publish", icon: Workflow, title: "Draft & Publish", color: "[#46ad07]" },
        { href: "/docs/releases", icon: Rocket, title: "Releases", color: "[#46ad07]" },
        { href: "/docs/settings", icon: Settings, title: "Settings", color: "[#46ad07]" },
    ];

    const devopsLinks = [
        { href: "/docs/project-creation", icon: Rocket, title: "Project creation", color: "[#de4f00]" },
        { href: "/docs/usage-billing", icon: Users, title: "Usage & Billing", color: "[#de4f00]" },
        { href: "/docs/project-settings", icon: Settings, title: "Project settings", color: "[#de4f00]" },
        { href: "/docs/deployments", icon: Server, title: "Deployments management", color: "[#de4f00]" },
        { href: "/docs/profile-settings", icon: Shield, title: "Profile settings", color: "[#de4f00]" },
    ];

    return (
        <section className="container mx-auto px-4 py-16">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-center">{title}</h1>
            <p className="mx-auto mb-16 max-w-3xl text-lg text-muted-foreground sm:text-xl text-center">
                {description}
            </p>

            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                <FeatureCard
                    href="/docs/developer"
                    icon={Code}
                    title={card1.title}
                    description={card1.description}
                    imageIdentifier={card1.backgroundImageUrl?.identifier}
                    color="[#a21caf]"
                    links={developerLinks}
                />

                <FeatureCard
                    href="/docs/authoring"
                    icon={PenTool}
                    title={card2.title}
                    description={card2.description}
                    imageIdentifier={card2.backgroundImageUrl?.identifier}
                    color="[#46ad07]"
                    links={authoringLinks}
                />

                <FeatureCard
                    href="/docs/devops"
                    icon={Server}
                    title={card3.title}
                    description={card3.description}
                    imageIdentifier={card3.backgroundImageUrl?.identifier}
                    color="[#de4f00]"
                    links={devopsLinks}
                />
            </div>
        </section>
    )
}

