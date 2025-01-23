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
      className={`group flex items-center gap-3 py-1.5 px-2 text-sm transition-colors rounded-lg ${
        color === '[#a21caf]' ? 'hover:bg-[#a21caf]/5' :
        color === '[#46ad07]' ? 'hover:bg-[#46ad07]/5' :
        color === '[#de4f00]' ? 'hover:bg-[#de4f00]/5' :
        'hover:bg-gray-500/5'
      }`}
    >
      <div className={`rounded-lg p-1 transition-colors ${
        color === '[#a21caf]' ? 'group-hover:bg-[#a21caf]/10' :
        color === '[#46ad07]' ? 'group-hover:bg-[#46ad07]/10' :
        color === '[#de4f00]' ? 'group-hover:bg-[#de4f00]/10' :
        'group-hover:bg-gray-500/10'
      }`}>
        <Icon className={`h-5 w-5 text-muted-foreground transition-colors ${
          color === '[#a21caf]' ? 'group-hover:text-[#a21caf]' :
          color === '[#46ad07]' ? 'group-hover:text-[#46ad07]' :
          color === '[#de4f00]' ? 'group-hover:text-[#de4f00]' :
          'group-hover:text-gray-500'
        }`} />
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

