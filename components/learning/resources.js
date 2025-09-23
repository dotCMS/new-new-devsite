import {
  BookOpen,
  BookText,
  PlayCircle,
  FileCode,
  HelpCircle,
  Newspaper,
} from "lucide-react";

export const DevResourceTypes = [
  {
    title: "Blogs",
    description: "dotCMS Developer Blogs",
    icon: Newspaper,
    image: "/dA/2b2c419535/asset/34318588-e166-4acc/70q/1000maxw/1024maxh/image-file",
    type: "blog",
  },
  {
    title: "Guides, How-tos & Examples",
    description:
      "Key concepts, best practices and step-by-step tutorials to help you master dotCMS",
    icon: BookOpen,
    image: "/dA/d0b93a663be354aa4853bfa8d4cb940f/70q/1000maxw",
    type: "howto",
  },
  {
    title: "Videos",
    description: "Video tutorials and walkthroughs for visual learners",
    icon: PlayCircle,
    image: "/dA/d07323dd1c7f4a316ccbe5bb90003776/70q/1000maxw",
    type: "video",
  },
  {
    title: "Knowledge Base",
    description: "Comprehensive documentation and reference materials",
    icon: HelpCircle,
    image: "/dA/20b347e3312095361d5f9cd7304e5699/70q/1000maxw",
    type: "kb",
  },
];
