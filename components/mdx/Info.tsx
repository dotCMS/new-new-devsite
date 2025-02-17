'use client'

import React from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from 'lucide-react'

const Info = ({ node, ...props }: any) => {
  const children = node?.children?.[0]?.value || props.children;
  return (
    <Alert className="my-4 justify-center bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" color="#1e40af" />
      <AlertDescription className="text-blue-800 dark:text-blue-200" style={{ marginTop: '1px' }}>
        {children}
      </AlertDescription>
    </Alert>
  )
}

export default Info
