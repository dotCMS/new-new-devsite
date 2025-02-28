import React from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from 'lucide-react'
import MarkdownContent from '../MarkdownContent'
import './infowarn.css'
import { processMarkdownContent } from './markdownUtils'

const Info = ({ node, ...props }: any) => {
  // Process content using the shared utility function
  const content = processMarkdownContent(node, props);
  
  return (
    <Alert className="justify-center bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" color="#1e40af" />
      <AlertDescription className="text-blue-800 dark:text-blue-200" style={{ marginTop: '1px' }}>
        {typeof content === 'string' ? (
          <MarkdownContent content={content} className="infoWarnContent"/>
        ) : (
          content
        )}
      </AlertDescription>
    </Alert>
  )
}

export default Info
