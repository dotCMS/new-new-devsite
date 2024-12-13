import Link from 'next/link'
import { Separator } from "@/components/ui/separator"
import { Github, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="container mx-auto flex flex-col items-center justify-center py-12">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-xl font-bold">dotCMS</h2>
          <p className="text-sm text-muted-foreground">
            Modern content management, made simple.
          </p>
        </div>

        <div className="mb-8 flex items-center space-x-6">
          <Button variant="ghost" size="icon" asChild className="hover:bg-transparent">
            <Link href="https://github.com/dotcms">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="hover:bg-transparent">
            <Link href="https://twitter.com/dotcms">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="hover:bg-transparent">
            <Link href="https://linkedin.com/company/dotcms">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </Button>
        </div>

        <Separator className="mb-8 w-full max-w-xs" />

        <nav className="mb-8 flex flex-wrap justify-center gap-x-8 gap-y-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
            Blog
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
            Contact
          </Link>
        </nav>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} dotCMS. All rights reserved.
        </p>
      </div>
    </footer>
  )
} 