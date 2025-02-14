import { Metadata } from "next"
import { LearningCenterGrid } from "@/components/learning/devresource-grid"
import Header from "@/components/header/header"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "dotCMS Learning Center",
  description: "Explore tutorials, guides, examples, videos and knowledge base articles to master dotCMS",
}

export default async function LearningCenterPage({ params, searchParams }) {

    const finalParams = await params;
    const slug = finalParams.slug



  return (
            <div className="flex flex-col min-h-screen">
                <Header  />
    <div className="container relative">
    <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          This is the detail page
        </h1>
    </div>
  )
  <Footer />
</div>
  )
}