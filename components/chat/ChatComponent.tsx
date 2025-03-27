"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Bot, UserCircle, Search, MessageSquare, X } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { cn } from "@/util/utils"
import { CopyButton } from "@/components/chat/CopyButton"
import { Config } from "@/util/config"
import { Toggle } from "@/components/ui/toggle"
import { SearchResult } from "@/components/chat/SearchResult"

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
  isSearchResult?: boolean
}

const CHAT_STORAGE_KEY = "ai-chat-history"
const SEARCH_STORAGE_KEY = "search-history"
const API_KEY = Config.AuthToken;
const API_ENDPOINT = Config.DotCMSHost;

export function ChatComponent() {
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [searchMessages, setSearchMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("")
  const [mode, setMode] = useState<"ai" | "search">("ai")
  const abortControllerRef = useRef<AbortController | null>(null)

  // Add refs for the messages container and form
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastUserMessageRef = useRef<HTMLDivElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Helper function to handle example question clicks
  const handleExampleClick = (question: string) => {
    setInput(question);
    setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 100);
  }

  // Load saved messages
  useEffect(() => {
    const savedChatMessages = localStorage.getItem(CHAT_STORAGE_KEY)
    const savedSearchMessages = localStorage.getItem(SEARCH_STORAGE_KEY)
    if (savedChatMessages) {
      setChatMessages(JSON.parse(savedChatMessages))
    }
    if (savedSearchMessages) {
      setSearchMessages(JSON.parse(savedSearchMessages))
    }
  }, [])

  // Save messages
  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages))
  }, [chatMessages])

  useEffect(() => {
    localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(searchMessages))
  }, [searchMessages])

  // Scroll for new AI chat messages, but not search results
  useEffect(() => {
    if (chatMessages.length > 0 && mode === "ai") {
      scrollToBottom()
    }
  }, [chatMessages, mode])

  const messages = mode === "search" ? searchMessages : chatMessages
  const setMessages = mode === "search" ? setSearchMessages : setChatMessages

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Scroll when streaming messages only
  useEffect(() => {
    if (currentStreamingMessage) {
      scrollToBottom()
    }
  }, [currentStreamingMessage])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    const inputTrimmed = input.trim();
    const userMessage: Message = {
      role: "user",
      content: inputTrimmed,
      timestamp: Date.now()
    }
    setChatMessages(prev => [...prev, userMessage])
    setLoading(true)

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    try {
      // Format chat history for context
      const chatHistory = messages.map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`).join('\n');
      const fullPrompt = `${chatHistory}\nHuman: ${inputTrimmed}`;

      const response = await fetch(`${API_ENDPOINT}/api/v1/ai/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          indexName: "default",
          prompt: fullPrompt,
          model: Config.AIModel,
          temperature: "1",
          responseLengthTokens: "1500",
          operator: "cosine",
          threshold: ".25",
          stream: true
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) throw new Error('Network response was not ok')
      var finalMessage = "";
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      // Read the data
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value)
        
        // Split the chunk into individual SSE messages
        const messages = chunk
          .split('\n')
          .filter(line => line.startsWith('data: '))
          .map(line => line.slice(6)) // Remove 'data: ' prefix

          if(chunk.includes("[DONE]")) {
            break;
          }

        for (const message of messages) {
          try {
            const parsed = JSON.parse(message)
            if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                setCurrentStreamingMessage(prev => prev + parsed.choices[0].delta.content)
                finalMessage = finalMessage + parsed.choices[0].delta.content;
            }
          } catch (e) {
            console.error('Error parsing SSE message:', e)
            break;
            
          }
        }
      }
      
      //console.log("setting message:" + finalMessage);
      // After streaming is complete, add the full message to the messages array
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: finalMessage,
        timestamp: Date.now()
      }])

    // Only clear the streaming message after adding it to messages

    setCurrentStreamingMessage("")


    } catch (error) {
      // Only show error if not aborted
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Error:', error)
        const errorMessage: Message = {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
          timestamp: Date.now()
        }
        setChatMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const clearHistory = () => {
    // Abort any ongoing streaming response
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setCurrentStreamingMessage("")
    if (mode === "search") {
      setSearchMessages([])
      localStorage.removeItem(SEARCH_STORAGE_KEY)
    } else {
      setChatMessages([])
      localStorage.removeItem(CHAT_STORAGE_KEY)
    }
    setInput("")
  }

  async function handleSearch(query: string) {
    setLoading(true)
    try {
      const response = await fetch(`${API_ENDPOINT}/api/v1/ai/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model:"gpt-4o",
          indexName: "default",
          prompt: query,
          operator: "cosine",
          threshold: ".25",
          searchLimit:10,
        }),
      })

      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      
      // Format search results
      const searchResults = data.dotCMSResults.filter((result: any) => 
        result.contentType.toLowerCase() === "dotcmsdocumentation" || 
        result.contentType.toLowerCase() === "devresource" || 
        result.contentType.toLowerCase() === "blog"
      ).map((result: any) => ({
        role: "assistant" as const,
        content: JSON.stringify({
          title: result.title || 'Untitled Result',
          matches: result.matches || [],
          content: truncateText(result.matches[0].extractedText, 200),
          inode: result.inode,
          url: result.urlMap || result.slug || result.urlTitle,
          score: parseFloat(result.matches[0].distance),
          contentType: result.contentType || 'documentation',
          modDate: result.modDate,
        }),
        timestamp: Date.now(),
        isSearchResult: true
      }))

      // Update search messages instead of all messages
      setSearchMessages(prev => [
        ...prev,
        { role: "user", content: query, timestamp: Date.now() },
        ...searchResults
      ])

      // Scroll to the last user message after adding search results
      setTimeout(() => {
        lastUserMessageRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)

    } catch (error) {
      console.error('Error:', error)
      setSearchMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, there was an error processing your search request.",
        timestamp: Date.now()
      }])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    if (mode === "search") {
      await handleSearch(input.trim())
    } else {
      await sendMessage(e)
    }
  }

  const clearInput = () => {
    setInput("")

  }

  const handleModeChange = async (pressed: boolean) => {
    // Abort any ongoing streaming response
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setCurrentStreamingMessage("")
    
    const newMode = pressed ? "search" : "ai"
    setMode(newMode)
    
    // If switching to search mode and there's input, trigger search
    if (newMode === "search" && input.trim()) {
      await handleSearch(input.trim())
    }
  }

  return (
    <div className="flex flex-col h-full relative max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center p-2 sm:p-4 border-b">
        <div className="flex gap-2">
          <Button
            variant={mode === "ai" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleModeChange(false)}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </Button>
          <Button
            variant={mode === "search" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleModeChange(true)}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearHistory}
              className="h-8 w-8"
              title="Clear history"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Searching documentation...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Bot className="w-16 h-16 text-primary" />
                <h2 className="text-2xl font-semibold">Welcome to dotAI Assistant</h2>
                <p className="text-muted-foreground max-w-md">
                  I can answer your questions or help you find information about the dotCMS platform. Here are some example questions:
                </p>
                <div className="space-y-2 text-left w-full max-w-md px-2 sm:px-0">
                  <div className="p-2 sm:p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 text-center text-sm sm:text-base" 
                       onClick={() => handleExampleClick("What are the system requirements for dotCMS?")}>
                    What are the system requirements for dotCMS?
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 text-center text-sm sm:text-base"
                       onClick={() => handleExampleClick("How do I create a new content type in dotCMS?")}>
                    How do I create a new content type in dotCMS?
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 text-center text-sm sm:text-base"
                       onClick={() => handleExampleClick("How do I search content using rest api??")}>
                    How do I search content using the rest api?
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            ref={message.role === "user" ? lastUserMessageRef : undefined}
            className={cn(
              "flex items-start gap-2 sm:gap-4 rounded-lg p-2 sm:p-4",
              message.role === "user" 
                ? "bg-muted/50" 
                : message.isSearchResult
                  ? "bg-blue-500/10"
                  : "bg-primary/10"
            )}
          >
            {message.role === "user" ? (
              <UserCircle className="w-6 h-6 sm:w-8 sm:h-8" />
            ) : (
              <Bot className="w-6 h-6 sm:w-8 sm:h-8" />
            )}
            <div className="flex-1 space-y-2 overflow-hidden">
              <p className={`text-sm ${message.role === "user" ? "font-bold" : "font-medium "}`}>
                {message.role === "user" ? "You" : message.isSearchResult ? "Search Result" : "dotAI Assistant"}
              </p>
              {message.isSearchResult ? (
                <SearchResult {...JSON.parse(message.content)} />
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code: ({ node, inline, className, children, ...props }: {
                        node?: any;
                        inline?: boolean;
                        className?: string;
                        children?: React.ReactNode;
                        [key: string]: any;
                      }) => {
                        const match = /language-(\w+)/.exec(className || '')
                        const codeContent = String(children).replace(/\n$/, '')
                        
                        return !inline && match ? (
                              <div className="relative">
                              <CopyButton text={codeContent} />
                              <SyntaxHighlighter
                                  {...props}
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  customStyle={{
                                  margin: 0,
                                  padding: '1rem',
                                  maxWidth: '100%',
                                  overflowX: 'auto',
                                  backgroundColor: 'rgb(30, 41, 59)',
                                  borderRadius: '0.5rem',
                                  }}
                              >
                                  {codeContent}
                              </SyntaxHighlighter>
                              </div>
                        ) : (
                          <code {...props} className={className}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {currentStreamingMessage && mode === "ai" && (
          <div className="flex items-start gap-4 rounded-lg p-4 bg-primary/10">
            <Bot className="w-8 h-8" />
            <div className="flex-1 space-y-2 overflow-hidden">
              <p className="text-sm font-medium">dotAI Assistant</p>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    code({
                      node,
                      inline,
                      className,
                      children,
                      ...props
                    }: {
                      node?: any;
                      inline?: boolean;
                      className?: string;
                      children?: React.ReactNode;
                      [key: string]: any;
                    }) {
                      const match = /language-(\w+)/.exec(className || '')
                      const codeContent = String(children).replace(/\n$/, '')
                      return !inline && match ? (
                        <div className="relative">
                          <CopyButton text={codeContent} />
                          <SyntaxHighlighter
                            {...props}
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              maxWidth: '100%',
                              overflowX: 'auto',
                              backgroundColor: 'rgb(30, 41, 59)',
                              borderRadius: '0.5rem',
                              padding: '1rem'
                            }}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {currentStreamingMessage}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="p-2 sm:p-4 border-t flex gap-2 sm:gap-4 items-end"
      >
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            className="w-full p-2 pr-8 bg-background border rounded-md text-sm sm:text-base"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "search" 
                ? "Search the dev site..." 
                : messages.length > 0 && mode === "ai"
                    ? "Ask a follow up..." 
                    : "Ask a question..."}
            disabled={loading}
          />
          {input  && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
            >
              <X className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === "search" ? (
            <Search className="w-4 h-4" />
          ) : (
            <MessageSquare className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  )
}
