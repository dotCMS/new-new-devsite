'use client'

import { useEffect, useState } from 'react'
import DangerousHtmlComponent from '../DangerousHtmlComponent'
import Warn from './Warn'

interface IncludeProps {
  urlToInclude: string
}

export function Include({ urlToInclude }: IncludeProps) {
  const [content, setContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  console.log("urlToInclude",urlToInclude)
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(urlToInclude)
        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.statusText}`)
        }
        const text = await response.text()
        setContent(text)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch content')
      }
    }

    if (urlToInclude) {
      fetchContent()
    }
  }, [urlToInclude])

  if (error) {
    return <Warn>Error: {error}</Warn>
  }

  if (!content) {
    return <div className="animate-pulse">Loading...</div>
  }

  return (
    <DangerousHtmlComponent content={content} />
  )
}
