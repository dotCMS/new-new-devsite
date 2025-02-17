import { Card, CardContent } from "@/components/ui/card"
    import Link from "next/link"
import { LucideIcon, Code } from "lucide-react"
import { DocLink } from "@/components/content-types/doc-link"
import { Config } from "@/util/config";
import Image from "next/image";
interface DocLinkType {
    url: string;
    icon: any;
    title: string;
    color: string;
}

interface FeatureCardProps {
    href: string;
    icon: LucideIcon;
    title: string;
    description: string;
    imageIdentifier?: string;
    color: string;
    links: DocLinkType[];
    count: number;
}

export default function FeatureCard({
    href,
    icon: Icon,
    title,
    description,
    imageIdentifier,
    color,
    count = 0,
    links = []
}: FeatureCardProps) {

    const imageUrl = imageIdentifier && (imageIdentifier.startsWith('http') || imageIdentifier.startsWith('/dA/')) ? imageIdentifier : `${Config.CDNHost}/dA/${imageIdentifier}/1024maxw/80q/`;
    const myHref = count < 0 ? "#" : href;

    return (
        <div className="space-y-4">
            <Link href={myHref} className="block">
                <Card className={`overflow-hidden transition-all duration-300 group border border-border hover:border-${color} relative h-[300px]`}>
                    <CardContent className="p-6 relative z-10 h-full flex flex-col">
                        <div className="mb-4 flex items-center gap-2">
                            <Icon className={`h-6 w-6 transition-colors group-hover:text-${color}`} />
                            <div className="flex items-center gap-2">
                                <h3 className={`text-xl font-semibold transition-colors group-hover:text-${color}`}>{title}</h3>
                                {count > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                        {count}
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="mb-6 text-sm text-muted-foreground">
                            {description}
                        </p>
                        <div className="mt-auto flex justify-center w-full">
                            <Image
                                src={`${imageUrl}`}
                                alt={`${title} illustration`}
                                width={400}
                                height={150}
                                className="rounded-lg object-cover"
                            />
                        </div>
                    </CardContent>
                    <div
                        className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                        style={{
                            "--tw-gradient-from": `rgb(${color} / 0.3)`,
                            "--tw-gradient-stops": "var(--tw-gradient-from), transparent, var(--tw-gradient-to)",
                            "--tw-gradient-to": "transparent",
                            background: "linear-gradient(45deg, var(--tw-gradient-stops))",
                        } as React.CSSProperties}
                    />
                </Card>
            </Link>
            <div className="space-y-1">
                {links.map((link) => (
                    <DocLink
                        key={`${link.url}-${link.title}`}
                        href={link.url}
                        icon={Icon} // we'll need to change this to the actual icon
                        title={link.title}
                        color={color}
                    />
                ))}
            </div>
        </div>
    )
} 