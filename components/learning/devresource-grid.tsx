import Link from "next/link"
import { DevResourceTypes } from "./resources"
import FeatureCard from "../content-types/feature-card"
import { GraduationCap, Newspaper } from "lucide-react"
export function DevResourceGrid(count: any) {

  
  return (
    <>
    <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 py-8 md:py-12 lg:py-16">
    <h1 className="text-center font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
      Learn dotCMS
    </h1>
    <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
      Your hub for mastering dotCMS. Explore resources designed to help you succeed.
    </p>
  </div>
    <div className="flex flex-wrap justify-center gap-6 pb-16">
        
      {DevResourceTypes.map((resource) => {
        const Icon = resource.icon

        if(resource?.type === "blog"){
            return (
                <Link           
                key={resource.type} 
                href={`/blog`}
                className="group w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                prefetch={false}
              >
    
                <FeatureCard
                  href={`/blog`}
                  icon={Icon}
                  title={resource.title}
                  description={resource.description}
                  imageIdentifier={resource.image}
                  color="[#a21caf]"
                  count={-1}
                  links={[]}
                />
              </Link>
            )
        }
        if ((count.count[resource.type] || -1 )>0) {


        return (


          <Link 
            key={resource.type} 
            href={`/learning/?type=${resource.type}`}
            className="group w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            prefetch={false}
          >

            <FeatureCard
              href={`/learning/?type=${resource.type}`}
              icon={Icon}
              title={resource.title}
              description={resource.description}
              imageIdentifier={resource.image}
              color="[#a21caf]"
              count={0}
              links={[]}
            />
          </Link>
        )
      }})}

      <Link 
        key="lms" 
        href={`https://dotcms.talentlms.com/plus/login`}
        className="group w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
        prefetch={false}
      >
        <FeatureCard
          href={`https://dotcms.talentlms.com/plus/login`}
          icon={GraduationCap}
          title={"Training & Courses"}
          description={"Learn dotCMS with our comprehensive training courses"}
          imageIdentifier={"/dA/68d9824f3e0afff7f637650a3a41dc2f/70q/1000maxw"}
          color="[#a21caf]"
          count={-1}
          links={[]}
        />
      </Link>
    </div>
    </>
  )
}