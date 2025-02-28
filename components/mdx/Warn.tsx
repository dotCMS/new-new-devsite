import React from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangleIcon } from 'lucide-react'
import MarkdownContent from '../MarkdownContent'
import './infowarn.css'
import { processMarkdownContent } from './markdownUtils'

const Warn = ({ node, ...props }: any) => {
  // Process content using the shared utility function
  const content = processMarkdownContent(node, props);
  
  return (
    <Alert className="my-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 flex items-center gap-3">
      <AlertTriangleIcon className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" color="#991b1b" />
      <AlertDescription className="text-red-800 dark:text-red-200" style={{ marginTop: '1px' }}>
        {typeof content === 'string' ? (
          <MarkdownContent content={content} className="infoWarnContent"/>
        ) : (
          content
        )}
      </AlertDescription>
    </Alert>
  )
}

export default Warn
