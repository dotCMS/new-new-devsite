import React from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from 'lucide-react'
import './infowarn.css'
import MarkdownContent from '../MarkdownContent'

const Info = ({ node, children, rawContent, ...props }: any) => {
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
    <Alert className="justify-center bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" color="#1e40af" />
      <AlertDescription className="text-blue-800 dark:text-blue-200" style={{ marginTop: '1px' }}>
        {content}
      </AlertDescription>
    </Alert>
  )
}

export default Info
