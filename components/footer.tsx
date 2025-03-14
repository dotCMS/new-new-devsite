import Link from 'next/link'
import { Separator } from "@/components/ui/separator"
import { Github, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import DiscourseLink from "@/components/header/DiscourseLink"
export default function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="container mx-auto flex flex-col items-center justify-center py-12">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-xl font-bold">dotCMS</h2>
          <p className="text-sm text-muted-foreground">
            Universal content management, made simple.
          </p>
        </div>

        <div className="mb-8 flex items-center space-x-6">
          <Button variant="ghost" size="icon" asChild className="hover:bg-transparent">
            <Link href="https://github.com/dotcms" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="hover:bg-transparent">
            <Link href="https://twitter.com/dotcms" target="_blank" rel="noopener noreferrer">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="hover:bg-transparent">
            <Link href="https://linkedin.com/company/dotcms" target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="hover:bg-transparent">
            
              <DiscourseLink position="footer" />
              
          </Button>
        </div>

        <Separator className="mb-8 w-full max-w-xs" />

        <nav className="mb-8 flex flex-wrap justify-center gap-x-8 gap-y-4">
        <Link href="https://www.dotcms.com" className="text-sm text-muted-foreground hover:text-foreground">
            Main Site
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            dotDev Home
          </Link>
          <Link href="https://www.dotcms.com/company/about-us" prefetch={false} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link href="/blog" prefetch={false} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
            Blog
          </Link>
          <Link href="https://www.dotcms.com/contact-us" prefetch={false}   target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
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