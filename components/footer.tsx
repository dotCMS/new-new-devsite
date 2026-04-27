import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DiscourseLink from "@/components/header/DiscourseLink";

export type FooterVariant = "full" | "content";

type FooterProps = {
  /**
   * `content` = sits at the bottom of a doc/content column (not full-bleed).
   * `full` = default site footer with centered `container` layout.
   */
  variant?: FooterVariant;
};

const year = new Date().getFullYear();

export default function Footer({ variant = "full" }: FooterProps) {
  const isContent = variant === "content";

  if (isContent) {
    return (
      <footer className="mb-6 mt-16 w-full min-w-0 max-w-full pr-4 sm:pr-6 lg:pr-8 sm:mb-8">
        {/*
          Card-style footer: `pr-*` insets from the right viewport edge; bottom margin spares the window bottom.
         */}
        <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-border/20 bg-[#FCFCFD] py-10 sm:py-12 dark:border-border/15 dark:bg-zinc-950/15">
          <div className="w-full max-w-full px-4 sm:px-6 lg:px-10">
            <div className="grid w-full grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div>
              <h2 className="text-base font-bold text-foreground">dotCMS</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Universal content management, made simple.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase leading-none tracking-wider text-muted-foreground">
                Resources
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
                    dotDev Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    prefetch={false}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/changelogs"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    prefetch={false}
                  >
                    Changelogs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/current-releases"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    prefetch={false}
                  >
                    Current releases
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase leading-none tracking-wider text-muted-foreground">
                Company
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link
                    href="https://www.dotcms.com/company/about-us"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    prefetch={false}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.dotcms.com/contact-us"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    prefetch={false}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://security.dotcms.com"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Trust Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase leading-none tracking-wider text-muted-foreground">
                Connect
              </h3>
              <div className="mt-4 flex flex-wrap items-center gap-1">
                <Button variant="ghost" size="icon" asChild className="h-9 w-9 hover:bg-transparent">
                  <Link href="https://github.com/dotcms" target="_blank" rel="noopener noreferrer">
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="h-9 w-9 hover:bg-transparent">
                  <Link href="https://twitter.com/dotcms" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Twitter</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="h-9 w-9 hover:bg-transparent">
                  <Link
                    href="https://linkedin.com/company/dotcms"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="h-9 w-9 hover:bg-transparent">
                  <DiscourseLink position="footer" />
                </Button>
              </div>
            </div>
            </div>
            <p className="mt-10 text-sm text-muted-foreground sm:mt-12">© {year} dotCMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }

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
            <Link
              href="https://linkedin.com/company/dotcms"
              target="_blank"
              rel="noopener noreferrer"
            >
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
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            dotDev Home
          </Link>
          <Link
            href="/blog"
            prefetch={false}
            className="text-sm text-muted-foreground hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            Blog
          </Link>
          <Link
            href="/docs/changelogs"
            prefetch={false}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Changelogs
          </Link>
          <Link
            href="/docs/current-releases"
            prefetch={false}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Current releases
          </Link>
          <Link
            href="https://www.dotcms.com/company/about-us"
            prefetch={false}
            className="text-sm text-muted-foreground hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            About
          </Link>
          <Link
            href="https://www.dotcms.com/contact-us"
            prefetch={false}
            className="text-sm text-muted-foreground hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact
          </Link>
          <Link href="/docs/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Link>
          <Link
            href="https://security.dotcms.com"
            className="text-sm text-muted-foreground hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            Trust Center
          </Link>
        </nav>

        <p className="text-sm text-muted-foreground">© {year} dotCMS. All rights reserved.</p>
      </div>
    </footer>
  );
}
