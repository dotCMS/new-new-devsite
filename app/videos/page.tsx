import Footer from "@/components/footer";
import Header from "@/components/header/header";

export default function VideosPage() {
  return (<>
    <Header />
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">Video Tutorials</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-2xl font-semibold mb-2">Getting Started</h3>
            <p className="text-muted-foreground">Learn the basics of our platform in this introductory video series.</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-2xl font-semibold mb-2">Advanced Topics</h3>
            <p className="text-muted-foreground">Deep dive into advanced features and best practices.</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-2xl font-semibold mb-2">Tips & Tricks</h3>
            <p className="text-muted-foreground">Quick tips to improve your development workflow.</p>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}