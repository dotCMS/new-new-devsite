"use client"

import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface NavItem {
  title: string
  href?: string
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: "Getting Started",
    children: [
      { 
        title: "Introduction",
        children: [
          { title: "What is Platform", href: "/docs/introduction/what-is" },
          { title: "Key Features", href: "/docs/introduction/features" },
          { title: "System Requirements", href: "/docs/introduction/requirements" },
        ]
      },
      { 
        title: "Installation",
        children: [
          { title: "Quick Install", href: "/docs/installation/quick" },
          { title: "Manual Setup", href: "/docs/installation/manual" },
          { title: "Docker Setup", href: "/docs/installation/docker" },
        ]
      },
      { 
        title: "Quick Start",
        children: [
          { title: "First Steps", href: "/docs/quick-start/first-steps" },
          { title: "Configuration", href: "/docs/quick-start/configuration" },
          { title: "Deployment", href: "/docs/quick-start/deployment" },
        ]
      },
    ],
  },
  {
    title: "Core Concepts",
    children: [
      {
        title: "Architecture",
        children: [
          { title: "Overview", href: "/docs/architecture/overview" },
          { title: "Components", href: "/docs/architecture/components" },
          { title: "Data Flow", href: "/docs/architecture/data-flow" },
        ]
      },
      {
        title: "Components",
        children: [
          { title: "Basic Components", href: "/docs/components/basic" },
          { title: "Advanced Components", href: "/docs/components/advanced" },
          { title: "Custom Components", href: "/docs/components/custom" },
        ]
      },
      {
        title: "Routing",
        children: [
          { title: "Route Setup", href: "/docs/routing/setup" },
          { title: "Dynamic Routes", href: "/docs/routing/dynamic" },
          { title: "Middleware", href: "/docs/routing/middleware" },
        ]
      },
    ],
  },
  {
    title: "Advanced Topics",
    children: [
      {
        title: "State Management",
        children: [
          { title: "Context API", href: "/docs/state/context" },
          { title: "Redux Integration", href: "/docs/state/redux" },
          { title: "Zustand Setup", href: "/docs/state/zustand" },
        ]
      },
      {
        title: "Performance",
        children: [
          { title: "Optimization", href: "/docs/performance/optimization" },
          { title: "Caching", href: "/docs/performance/caching" },
          { title: "Code Splitting", href: "/docs/performance/code-splitting" },
        ]
      },
      {
        title: "Security",
        children: [
          { title: "Authentication", href: "/docs/security/authentication" },
          { title: "Authorization", href: "/docs/security/authorization" },
          { title: "Best Practices", href: "/docs/security/best-practices" },
        ]
      },
    ],
  },
]

function NavTree({ items }: { items: NavItem[] }) {
  const [openSections, setOpenSections] = useState<string[]>([])

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.title}>
          {item.children ? (
            <Collapsible
              open={openSections.includes(item.title)}
              onOpenChange={() => toggleSection(item.title)}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted">
                {item.title}
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    openSections.includes(item.title) && "rotate-90"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4">
                <NavTree items={item.children} />
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <a
              href={item.href}
              className="block rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.title}
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

export default function DocsPage() {
  return (
    <div className="container mx-auto flex min-h-screen gap-8 py-8">
      {/* Left Navigation */}
      <div className="w-64 shrink-0 border-r">
        <nav className="sticky top-8 pr-4">
          <h2 className="mb-4 text-lg font-semibold">Documentation</h2>
          <NavTree items={navigation} />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <h1 className="text-4xl font-bold mb-6">Documentation</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-xl text-muted-foreground">
            Welcome to our comprehensive documentation. Here you'll find everything
            you need to know about our platform.
          </p>
          {/* Add your main content here */}
        </div>
      </div>

      {/* Right Sidebar - Table of Contents */}
      <div className="w-48 shrink-0">
        <div className="sticky top-8">
          <h3 className="mb-4 text-sm font-semibold">On This Page</h3>
          <nav className="text-sm">
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#overview" className="hover:text-foreground">
                  Overview
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-foreground">
                  Features
                </a>
              </li>
              {/* Add more table of contents items */}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}