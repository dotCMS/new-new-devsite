"use client";

import { Code2, MessagesSquare } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react"
import DiscordLink from "./DiscordLink";
import GithubLink from "./GithubLink";
import Logo from "./Logo/Logo";
import { useTheme } from "next-themes"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Installation",
    href: "/docs/installation",
    description: "Step-by-step guide to get started with our platform.",
  },
  {
    title: "Typography",
    href: "/docs/typography",
    description: "Styles for headings, paragraphs, lists...etc",
  },
  {
    title: "Components",
    href: "/docs/components",
    description: "Common UI components built using Radix UI and Tailwind CSS.",
  },
  {
    title: "CLI",
    href: "/docs/cli",
    description: "Command line tools for managing your projects.",
  },
];

const blogs: { title: string; href: string; description: string }[] = [
  {
    title: "Latest Updates",
    href: "/blog/latest",
    description: "Stay up to date with our newest features and improvements.",
  },
  {
    title: "Tutorials",
    href: "/blog/tutorials",
    description: "Learn how to make the most of our platform.",
  },
  {
    title: "Case Studies",
    href: "/blog/case-studies",
    description: "Real-world examples of successful implementations.",
  },
];

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { systemTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Logo/>
        
        <NavigationMenu className="flex-1">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/"
                      >
                        <Code2 className="h-6 w-6" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          DevHub
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Your one-stop platform for development resources and tools.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/docs" title="Introduction">
                    Learn about the core concepts and architecture.
                  </ListItem>
                  <ListItem href="/docs/quickstart" title="Quick Start">
                    Get up and running in less than 5 minutes.
                  </ListItem>
                  <ListItem href="/docs/features" title="Features">
                    Explore our comprehensive feature set.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/docs/latest/quick-start-guide" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Documentation
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/blog" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Blog
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/videos" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Videos
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-2 ml-auto">

          <GithubLink />
          <DiscordLink />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";