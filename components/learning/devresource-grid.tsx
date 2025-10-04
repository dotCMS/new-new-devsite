import Link from "next/link";
import FeatureCard from "../content-types/feature-card";
import {
  BookOpenIcon,
  GraduationCap,
  NewspaperIcon,
  PlayCircleIcon,
} from "lucide-react";
export function DevResourceGrid(count: any) {
  return (
    <>
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 py-8 md:py-12 lg:py-16">
        <h1 className="text-center font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          Learn dotCMS
        </h1>
        <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
          Your hub for mastering dotCMS. Explore resources designed to help you
          succeed.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-6 pb-16">
        <Link
          key="blogs"
          href={`/blog`}
          className="group w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          prefetch={false}
        >
          <FeatureCard
            href={`/blog`}
            icon={NewspaperIcon}
            title="Blogs"
            description="dotCMS Developer Blogs"
            imageIdentifier="/dA/2b2c419535/asset/34318588-e166-4acc/70q/1000maxw/1024maxh/image-file"
            color="[#a21caf]"
            count={-1}
            links={[]}
          />
        </Link>

        <Link
          key="learning"
          href={`/learning/?type=howtos`}
          className="group w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          prefetch={false}
        >
          <FeatureCard
            href={`/learning/?type=howtos`}
            icon={BookOpenIcon}
            title="Guides, How-tos & Examples"
            description="Key concepts, best practices and step-by-step tutorials to help you master dotCMS"
            imageIdentifier="/dA/d0b93a663be354aa4853bfa8d4cb940f/70q/1000maxw"
            color="[#a21caf]"
            count={-1}
            links={[]}
          />
        </Link>

        <Link
          key="videos"
          href={`/videos`}
          className="group w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          prefetch={false}
        >
          <FeatureCard
            href={`/videos`}
            icon={PlayCircleIcon}
            title="Videos"
            description="Video tutorials and walkthroughs for visual learners"
            imageIdentifier="/dA/d07323dd1c7f4a316ccbe5bb90003776/70q/1000maxw"
            color="[#a21caf]"
            count={-1}
            links={[]}
          />
        </Link>

        <Link
          key="lms"
          href={`https://dotcms.talentlms.com/plus/login`}
          className="group w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          prefetch={false}
          target="_blank"
        >
          <FeatureCard
            href={`https://dotcms.talentlms.com/plus/login`}
            icon={GraduationCap}
            title={"Training & Courses"}
            description={"Learn dotCMS with our comprehensive training courses"}
            imageIdentifier={
              "/dA/68d9824f3e0afff7f637650a3a41dc2f/70q/1000maxw"
            }
            color="[#a21caf]"
            count={-1}
            links={[]}
          />
        </Link>
      </div>
    </>
  );
}
