import {
    PenTool,
    Code,
    Server,
} from "lucide-react"
import FeatureCard from "./feature-card"

interface Card {
    _map?: Record<string, any>;
    title: string;
    description: string;
    widgetCodeJSON?: string | any;
    identifier?: string;
    url?: string;
    layout?: string;
    titleImage?: {
        modDate?: string;
        sha256?: string;
        mime?: string;
        title?: string;
        versionPath?: string;
        focalPoint?: string;
        path?: string;
        isImage?: boolean;
        idPath?: string;
        size?: number;
        name?: string;
        width?: number;
        height?: number;
    };
    callToAction?: {
        url: string;
        icon: any;
        title: string;
        color: string;
    }[];
}

interface HeroProps {
    title: string;
    description: string;
    card1: Card;
    card2?: Card;
    card3?: Card;
}

export default function Hero(props: HeroProps) {
    const { title, description, card1, card2, card3 } = props;

    const developerLinks = card1?.callToAction || [];
    const authorLinks = card2?.callToAction || [];
    const devopsLinks = card3?.callToAction || [];

    if(!card1) {
        return <><h1>No cards</h1></>;
    }
    return (
        <section className="container mx-auto px-4 py-16">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-center">{title}</h1>
            <p className="mx-auto mb-16 max-w-3xl text-lg text-muted-foreground sm:text-xl text-center">
                {description}
            </p>

            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                <FeatureCard
                    href={card1?.url ? card1?.url : "/docs/developer"}
                    icon={Code}
                    title={card1?.title}
                    description={card1?.description}
                    imageIdentifier={card1?.titleImage?.idPath || ""}
                    color="[#a21caf]"
                    count={0}
                    links={developerLinks}
                    />

                {card2 && (
                    <FeatureCard
                        href={card2.url ? card2.url : "/docs/authoring"}
                        icon={PenTool}
                        title={card2?.title}
                        description={card2?.description}
                        imageIdentifier={card2?.titleImage?.idPath || ""}
                        color="[#46ad07]"
                        count={0}
                        links={authorLinks}
                    />
                )}

                {card3 && (
                    <FeatureCard
                        href={card3.url ? card3.url : "/docs/devops"}
                        icon={Server}
                        title={card3.title}
                        description={card3.description}
                        imageIdentifier={card3.titleImage?.idPath || ""}
                        color="[#de4f00]"   
                        count={0}
                        links={devopsLinks}
                    />
                )}
            </div>
        </section>
    )
}

