

import Link from "next/link"
import { resources } from "@/components/learning/resources"
import FeatureCard from "../content-types/feature-card"

export function DevResourceGrid(count: any) {

  
  return (
    <>
    <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 py-8 md:py-12 lg:py-16">
    <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
      Learn dotCMS
    </h1>
    <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
      Your hub for mastering dotCMS. Explore resources designed to help you succeed.
    </p>
  </div>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-16">
        
      {resources.map((resource) => {
        if ((count.count[resource.type] || -1 )>0) {
        const Icon = resource.icon
        return (
          <Link 
            key={resource.type} 
            href={`/learning/?type=${resource.type}`}
            className="group"
            prefetch={false}
          >

            <FeatureCard
              href={`/learning/?type=${resource.type}`}
              icon={Icon}
              title={resource.title}
              description={resource.description}
              imageIdentifier={resource.image}
              color="[#a21caf]"
              count={count.count[resource.type] || 0}
              links={[]}
            />
          </Link>
        )
      }})}
    </div>
    </>
  )
}