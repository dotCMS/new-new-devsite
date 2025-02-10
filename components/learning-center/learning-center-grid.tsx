"use client"

import { Card } from "@/components/ui/card"
import Link from "next/link"
import { BookOpen, BookText, PlayCircle, FileCode, HelpCircle } from "lucide-react" 
import Image from "next/image"
import { resources } from "@/components/learning-center/resources"
import FeatureCard from "../content-types/feature-card"

export function LearningCenterGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-16">
      {resources.map((resource) => {
        const Icon = resource.icon
        return (
          <Link 
            key={resource.type} 
            href={`/learning/resources?type=${resource.type}`}
            className="group"
            prefetch={false}
          >
            <FeatureCard
              href={`/learning/resources?type=${resource.type}`}
              icon={Icon}
              title={resource.title}
              description={resource.description}
              imageIdentifier={resource.image}
              color="[#a21caf]"
              links={[]}
            />
          </Link>
        )
      })}
    </div>
  )
}