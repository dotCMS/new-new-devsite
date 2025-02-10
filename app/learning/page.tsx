import { Metadata } from "next"
import { LearningCenterGrid } from "@/components/learning-center/learning-center-grid"
import Header from "@/components/header/header"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "dotCMS Learning Center",
  description: "Explore tutorials, guides, examples, videos and knowledge base articles to master dotCMS",
}

export default function LearningCenterPage() {
  return (
            <div className="flex flex-col min-h-screen">
                <Header  />
    <div className="container relative">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 py-8 md:py-12 lg:py-16">
        <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Learning Center
        </h1>
        <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
          Your central hub for mastering dotCMS. Explore our resources designed to help you succeed.
        </p>
      </div>
      <LearningCenterGrid />
    </div>
  )
  <Footer />
</div>
  )
}