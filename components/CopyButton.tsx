"use client"

import { Copy } from "lucide-react"
import { Button } from "./ui/button"
import { useState } from "react"

export function CopyButton() {
  const [copied, setCopied] = useState(false)

  const copy = (e: React.MouseEvent) => {
    const button = e.currentTarget;
    const codeBlock = button.closest('.relative')?.querySelector('code');
    const text = codeBlock?.textContent || '';
    setCopied(true);
    navigator.clipboard.writeText(text);

    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="absolute -top-1 -right-2 h-8 w-8 hover:bg-muted/50 z-10 rounded-md opacity-70 hover:opacity-100 transition-opacity"
      onClick={copy}
    >
      <Copy className={`h-4 w-4 ${copied ? 'text-green-500' : ''}`} />
    </Button>
  )
} 

