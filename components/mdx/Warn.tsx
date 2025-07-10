import React from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangleIcon } from 'lucide-react'
import './infowarn.css'
import MarkdownContent from '../MarkdownContent'

const Warn = ({ node, children, rawContent, ...props }: any) => {
  // If we have raw content from the remark plugin, use it directly
  let content;
  if (rawContent) {
    content = (
      <MarkdownContent 
        content={rawContent}
        className="infoWarnContent"
        disableBlockComponents={true}
      />
    );
  } else {
    // Fallback to children if no raw content (shouldn't happen in normal use)
    content = children;
  }
  
  return (
    <Alert className="my-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 flex items-center gap-3">
      <AlertTriangleIcon className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" color="#991b1b" />
      <AlertDescription className="text-red-800 dark:text-red-200" style={{ marginTop: '1px' }}>
        {content}
      </AlertDescription>
    </Alert>
  )
}

export default Warn
