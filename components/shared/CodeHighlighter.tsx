import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { CopyButton } from '../chat/CopyButton'
import { a11yLight, a11yDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { useTheme } from "next-themes"

interface CodeHighlighterProps {
  node?: any
  className?: string
  children?: React.ReactNode
  [key: string]: any
}



const CodeHighlighter: React.FC<CodeHighlighterProps> = ({ 
  node, 
  className, 
  children, 
  ...props 
}) => {
  const { theme } = useTheme()
  
  if (!children) return null;
  const match = /language-(\w+)/.exec(className || '')

  // Extract all text content from nested JSON nodes
  let allText = String(children);
  
  // Remove any backticks that might be coming from markdown
  allText = allText.replace(/^`+/, '').replace(/`+$/, '');
  
  const inline = !allText.includes("\n");
  const highlight = match ? match[1] : "html"

  // Inline code
  if (inline) {
    return (
      <code 
        className="bg-muted text-foreground text-sm font-mono px-1 py-0.5 rounded whitespace-normal" 
        {...props}
      >
        {children}
      </code>
    )
  }

  // Block code with syntax highlighting
  return (
    <div className="mb-6 relative w-full max-w-full min-w-0 bg-background border border-border rounded-lg overflow-hidden">
      <div className="absolute right-3 top-3 z-10">
        <CopyButton 
          text={allText} 
          variant="outline"
          className="bg-background hover:bg-accent text-foreground hover:text-accent-foreground" 
        />
      </div>
      <div className="w-full overflow-x-auto">
        <SyntaxHighlighter
          language={highlight}
          PreTag="div"
          style={theme === 'dark' ? a11yDark : a11yLight}
          className="!m-0 [&_pre]:!w-full [&_pre]:!min-w-0 [&_pre]:!max-w-full [&_code]:before:content-none [&_code]:after:content-none [&_code]:!whitespace-pre [&_code]:!block [&_code]:!w-full"
          customStyle={{
            width: '100%',
            padding: '1rem',
            paddingTop: '2rem',
            paddingBottom: '1.5rem',
            fontSize: '14px',
            backgroundColor: theme === 'dark' ? 'hsl(var(--muted))' : 'hsl(var(--card))',
            color: theme === 'dark' ? 'hsl(var(--muted-foreground))' : undefined,
  
          }}
          {...props}
        >
          {allText}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

export default CodeHighlighter
