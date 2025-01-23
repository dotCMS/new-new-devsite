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

interface HeroProps {
    title: string;
    description: string;
    image1: string;
    image2: string;
    image3: string;
    cardDescription1: string;
    cardDescription2: string;
    cardDescription3: string;
    cardTitle1: string;
    cardTitle2: string;
    cardTitle3: string;
    cardLink1: string;
    cardLink2: string;
    cardLink3: string;
}

export default function Hero(props: HeroProps) {
    const { title, description, image1, image2, image3, cardDescription1, cardDescription2, cardDescription3, cardTitle1, cardTitle2, cardTitle3, cardLink1, cardLink2, cardLink3 } = props;

    console.log('image 1', image1);

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
                        <Card className="overflow-hidden transition-all duration-300 group border border-gray-200 hover:border-[#a21caf] relative h-[300px]">
                            <CardContent className="p-6 relative z-10 h-full flex flex-col">
                                <div className="mb-4 flex items-center gap-2">
                                    <Code className="h-6 w-6 transition-colors group-hover:text-[#a21caf]" />
                                    <h3 className="text-xl font-semibold transition-colors group-hover:text-[#a21caf]">Developer</h3>
                                </div>
                                <p className="mb-6 text-sm text-muted-foreground">
                                    Access powerful SDKs and APIs to build custom integrations and extend dotCMS functionality.
                                </p>
                                <div className="mt-auto flex justify-center w-full">
                                    <Image
                                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-20%20at%2012.31.47%E2%80%AFPM-8aUKjfJNo5lAwgqqggtE3A9eKpbgHW.png"
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
                        <Card className="overflow-hidden transition-all duration-300 group border border-gray-200 hover:border-[#46ad07] relative h-[300px]">
                            <CardContent className="p-6 relative z-10 h-full flex flex-col">
                                <div className="mb-4 flex items-center gap-2">
                                    <PenTool className="h-6 w-6 transition-colors group-hover:text-[#46ad07]" />
                                    <h3 className="text-xl font-semibold transition-colors group-hover:text-[#46ad07]">
                                        Author
                                    </h3>
                                </div>
                                <p className="mb-6 text-sm text-muted-foreground">
                                    Create and manage content types, draft and publish content, and control the admin panel with ease.
                                </p>
                                <div className="mt-auto flex justify-center w-full">
                                    <Image
                                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-20%20at%2012.16.40%E2%80%AFPM-nIutcxHQ2BTjuzHhngOFeeioSVFvLP.png"
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
                        <Card className="overflow-hidden transition-all duration-300 group border border-gray-200 hover:border-[#de4f00] relative h-[300px]">
                            <CardContent className="p-6 relative z-10 h-full flex flex-col">
                                <div className="mb-4 flex items-center gap-2">
                                    <Server className="h-6 w-6 transition-colors group-hover:text-[#de4f00]" />
                                    <h3 className="text-xl font-semibold transition-colors group-hover:text-[#de4f00]">DevOps</h3>
                                </div>
                                <p className="mb-6 text-sm text-muted-foreground">
                                    Optimize performance, enhance security, and leverage CDN capabilities for seamless content delivery.
                                </p>
                                <div className="mt-auto flex justify-center w-full">
                                    <Image
                                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/devops-AdyIqtUuGbwt1CzH0IeFlSlBVWeBv2.svg"
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

