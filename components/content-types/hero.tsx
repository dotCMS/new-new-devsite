import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
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
import { DocLink } from "@/components/content-types/doc-link"

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

    return (
        <section className="container mx-auto px-4 py-16">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-center">{title}</h1>
            <p className="mx-auto mb-16 max-w-3xl text-lg text-muted-foreground sm:text-xl text-center">
              {description}
            </p>

            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                {/* Developer Section */}
                <div className="space-y-4">
                    <Link href="/docs/developer" className="block">
                        <Card className="overflow-hidden transition-all duration-300 group border border-border hover:border-brand-purple relative h-[300px]">
                            <CardContent className="p-6 relative z-10 h-full flex flex-col">
                                <div className="mb-4 flex items-center gap-2">
                                    <Code className="h-6 w-6 transition-colors group-hover:text-[#a21caf]" />
                                    <h3 className="text-xl font-semibold transition-colors group-hover:text-[#a21caf]">{card1.title}</h3>
                                </div>
                                <p className="mb-6 text-sm text-muted-foreground">
                                    {card1.description}
                                </p>
                                <div className="mt-auto flex justify-center w-full">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_DOTCMS_HOST}/dA/${card1.backgroundImageUrl?.identifier || ''}`}
                                        alt="dotCMS API code example showing client initialization"
                                        width={400}
                                        height={150}
                                        className="rounded-lg object-cover"
                                    />
                                </div>
                            </CardContent>
                            <div
                                className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                style={
                                    {
                                        "--tw-gradient-from": "rgb(162 28 175 / 0.3)",
                                        "--tw-gradient-stops": "var(--tw-gradient-from), transparent, var(--tw-gradient-to)",
                                        "--tw-gradient-to": "transparent",
                                        background: "linear-gradient(45deg, var(--tw-gradient-stops))",
                                    } as React.CSSProperties
                                }
                            />
                        </Card>
                    </Link>
                    <div className="space-y-1">
                        <DocLink href="/docs/rest-api" icon={Code} title="REST API" color="[#a21caf]" />
                        <DocLink href="/docs/graphql" icon={Database} title="GraphQL API" color="[#a21caf]" />
                        <DocLink href="/docs/document-service" icon={FileText} title="Document Service API" color="[#a21caf]" />
                        <DocLink href="/docs/plugin-sdk" icon={Plugin} title="Plugin SDK" color="[#a21caf]" />
                        <DocLink href="/docs/upgrade" icon={Upload} title="Upgrade Guide" color="[#a21caf]" />
                    </div>
                </div>

                {/* Authoring Guide Section */}
                <div className="space-y-4">
                    <Link href="/docs/authoring" className="block">
                        <Card className="overflow-hidden transition-all duration-300 group border border-border hover:border-brand-green relative h-[300px]">
                            <CardContent className="p-6 relative z-10 h-full flex flex-col">
                                <div className="mb-4 flex items-center gap-2">
                                    <PenTool className="h-6 w-6 transition-colors group-hover:text-[#46ad07]" />
                                    <h3 className="text-xl font-semibold transition-colors group-hover:text-[#46ad07]">
                                        {card2.title}
                                    </h3>
                                </div>
                                <p className="mb-6 text-sm text-muted-foreground">
                                    {card2.description}
                                </p>
                                <div className="mt-auto flex justify-center w-full">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_DOTCMS_HOST}/dA/${card2.backgroundImageUrl?.identifier || ''}`}
                                        alt="dotCMS authoring interface showing content creation screen"
                                        width={400}
                                        height={150}
                                        className="rounded-lg object-cover"
                                    />
                                </div>
                            </CardContent>
                            <div
                                className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                style={
                                    {
                                        "--tw-gradient-from": "rgb(70 173 7 / 0.3)",
                                        "--tw-gradient-stops": "var(--tw-gradient-from), transparent, var(--tw-gradient-to)",
                                        "--tw-gradient-to": "transparent",
                                        background: "linear-gradient(45deg, var(--tw-gradient-stops))",
                                    } as React.CSSProperties
                                }
                            />
                        </Card>
                    </Link>
                    <div className="space-y-1">
                        <DocLink href="/docs/content-types" icon={FileText} title="Content-Types Builder" color="[#46ad07]" />
                        <DocLink href="/docs/content-manager" icon={PenTool} title="Content Manager" color="[#46ad07]" />
                        <DocLink href="/docs/draft-publish" icon={Workflow} title="Draft & Publish" color="[#46ad07]" />
                        <DocLink href="/docs/releases" icon={Rocket} title="Releases" color="[#46ad07]" />
                        <DocLink href="/docs/settings" icon={Settings} title="Settings" color="[#46ad07]" />
                    </div>
                </div>

                {/* DevOps Section */}
                <div className="space-y-4">
                    <Link href="/docs/devops" className="block">
                        <Card className="overflow-hidden transition-all duration-300 group border border-border hover:border-brand-orange relative h-[300px]">
                            <CardContent className="p-6 relative z-10 h-full flex flex-col">
                                <div className="mb-4 flex items-center gap-2">
                                    <Server className="h-6 w-6 transition-colors group-hover:text-[#de4f00]" />
                                    <h3 className="text-xl font-semibold transition-colors group-hover:text-[#de4f00]">{card3.title}</h3>
                                </div>
                                <p className="mb-6 text-sm text-muted-foreground">
                                    {card3.description}
                                </p>
                                <div className="mt-auto flex justify-center w-full">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_DOTCMS_HOST}/dA/${card3.backgroundImageUrl?.identifier || ''}`}
                                        alt="dotCMS DevOps infrastructure diagram"
                                        width={400}
                                        height={150}
                                        className="rounded-lg object-contain bg-white"
                                    />
                                </div>
                            </CardContent>
                            <div
                                className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                style={
                                    {
                                        "--tw-gradient-from": "rgb(222 79 0 / 0.3)",
                                        "--tw-gradient-stops": "var(--tw-gradient-from), transparent, var(--tw-gradient-to)",
                                        "--tw-gradient-to": "transparent",
                                        background: "linear-gradient(45deg, var(--tw-gradient-stops))",
                                    } as React.CSSProperties
                                }
                            />
                        </Card>
                    </Link>
                    <div className="space-y-1">
                        <DocLink href="/docs/project-creation" icon={Rocket} title="Project creation" color="[#de4f00]" />
                        <DocLink href="/docs/usage-billing" icon={Users} title="Usage & Billing" color="[#de4f00]" />
                        <DocLink href="/docs/project-settings" icon={Settings} title="Project settings" color="[#de4f00]" />
                        <DocLink href="/docs/deployments" icon={Server} title="Deployments management" color="[#de4f00]" />
                        <DocLink href="/docs/profile-settings" icon={Shield} title="Profile settings" color="[#de4f00]" />
                    </div>
                </div>
            </div>
        </section>
    )
}

