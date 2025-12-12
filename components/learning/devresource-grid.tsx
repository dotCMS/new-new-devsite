import Link from "next/link";
import FeatureCard from "../content-types/feature-card";
import {
  BookOpenIcon,
  GraduationCap,
  NewspaperIcon,
  PlayCircleIcon,
} from "lucide-react";
// Note: isometric icons were removed from this route; FeatureCard uses its own imagery.
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16 max-w-5xl mx-auto">
        <FeatureCard
          href={`/blog`}
          icon={NewspaperIcon}
          title="Blogs"
          description="A curated list of blogs for the discerning dotCMS developer."
          color="[#a21caf]"
          count={-1}
          links={[]}
          imageUrl="/static/icons/case-studies.svg"

        />

        <FeatureCard
          href={`/learning/listing`}
          icon={BookOpenIcon}
          title="Guides, How-tos & Examples"
          description="Key concepts, best practices, code snippets and step-by-step walkthroughs to help you master dotCMS."
          color="[#a21caf]"
          count={-1}
          links={[]}

          imageUrl="/static/icons/library.svg"
        />

        <FeatureCard
          href={`/videos`}
          icon={PlayCircleIcon}
          title="Videos"
          description="Video examples, demos and tutorials for visual learners."
          color="[#a21caf]"
          count={-1}
          links={[]}
          imageUrl="/static/icons/online-courses.svg"
        />

        <FeatureCard
          href={`https://dotcms.talentlms.com/plus/login`}
          icon={GraduationCap}
          title={"Training & Courses "}
          description={"Learn dotCMS with our training courses. "}
          externalLink={true}
          color="[#a21caf]"
          count={-1}
          links={[]}
          imageUrl="/static/icons/insight.svg"

        />
      </div>
    </>
  );
}
