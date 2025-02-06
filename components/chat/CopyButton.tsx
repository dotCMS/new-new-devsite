"use client"

import { Copy } from "lucide-react"
import { Button } from "../ui/button"
import { useState } from "react"
import { cn } from "@/util/utils"

interface CopyButtonProps {
  text?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function CopyButton({ text, className, variant = "ghost" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (!text) return
    setCopied(true)
    navigator.clipboard.writeText(text)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div 
        className="cursor-pointer"
        onClick={copy}
    >
      <Copy 
        className={cn(
          "h-4 w-4",
          copied ? "text-green-500" : "text-slate-500 dark:text-slate-500"
        )} 
      />
    </div>
  )
} 

