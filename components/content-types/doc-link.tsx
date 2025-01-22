import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface DocLinkProps {
  href: string
  icon: LucideIcon
  title: string
  color: string
}

export function DocLink({ href, icon: Icon, title, color }: DocLinkProps) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 py-1.5 px-2 text-sm transition-colors hover:bg-${color}/5 rounded-lg`}
    >
      <div className={`rounded-lg p-1 transition-colors group-hover:bg-${color}/10`}>
        <Icon className={`h-5 w-5 text-muted-foreground transition-colors group-hover:text-${color}`} />
      </div>
      <span className="font-medium text-muted-foreground transition-colors group-hover:text-foreground flex items-center gap-1">
        {title}
        <svg
          className={`h-3 w-3 text-muted-foreground transition-colors group-hover:text-${color}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </Link>
  )
}

