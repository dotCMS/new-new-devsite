import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Globe } from "lucide-react"
import { cn } from "@/util/utils"
import { Config } from "@/util/config"

interface LinkCardProps {
  title: string;
  description: string;
  links: Array<{
    url: string;
    icon: string | { identifier: string };
    title: string;
    disabled?: boolean;
    comingSoon?: boolean;
  }>;
}

export default function LinkCards(props: LinkCardProps) {
    const { title, description, links } = props;

    // Check for all required data
    if (!links?.length || !title || !links.every(link => link?.url && link?.title)) {
        return null;
    }

    return (
        <div className="space-y-4 my-16">
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="text-muted-foreground max-w-3xl">
                {description}
            </p>
            <div className="flex flex-wrap gap-3">
                {links.map((link, index) => {
                    // Additional safety check per link
                    if (!link?.url || !link?.title) return null;

                    return (
                        <Button 
                            key={index}
                            variant="outline" 
                            className={cn(
                                "h-11 px-4 gap-2",
                                link.disabled && "cursor-not-allowed opacity-60"
                            )} 
                            asChild={!link.disabled}
                            disabled={link.disabled}
                        >
                            {link.disabled && typeof link.icon === 'object' && link.icon?.identifier ? (
                                <div>
                                    <Image src={`${Config.CDNHost}/dA/${link.icon?.identifier}` || ''} alt={link.title} width={20} height={20} />
                                    <span className="flex items-center gap-2">
                                        {link.title}
                                        {link.comingSoon && (
                                            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                                                Coming Soon
                                            </span>
                                        )}
                                    </span>
                                </div>
                            ) : (
                                <Link href={link.url}>
                                    {typeof link.icon === 'object' && link.icon?.identifier ? (
                                        <Image 
                                            src={`${Config.CDNHost}/dA/${link.icon.identifier}`} 
                                            alt={link.title} 
                                            width={20} 
                                            height={20} 
                                        />
                                    ) : (
                                        <Globe className="h-5 w-5" />
                                    )}
                                    {link.title}
                                </Link>
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}

