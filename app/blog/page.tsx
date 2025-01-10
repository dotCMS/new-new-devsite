import Header from "@/components/header/header"
import Footer from "@/components/footer"

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Your existing blog content here */}
      </main>
      <Footer />
    </div>
  )
} 