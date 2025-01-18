"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Bot, UserCircle } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/chat/CopyButton"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

const STORAGE_KEY = "ai-chat-history"
const API_KEY = process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN;
const API_ENDPOINT = process.env.NEXT_PUBLIC_DOTCMS_HOST;
export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("")

  // Add refs for the messages container and form
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Helper function to handle example question clicks
  const handleExampleClick = (question: string) => {
    setInput(question);
    setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 100);
  }

  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY)
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Scroll when messages change or when streaming
  useEffect(() => {
    scrollToBottom()
  }, [messages, currentStreamingMessage])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    const inputTrimmed = input.trim();
    const userMessage: Message = {
      role: "user",
      content: inputTrimmed,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    //setInput("")

    try {
      const response = await fetch(`${API_ENDPOINT}/api/v1/ai/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          indexName: "default",
          prompt: inputTrimmed,
          model: "gpt-4o-mini",
          temperature: "1",
          responseLengthTokens: "1500",
          operator: "cosine",
          threshold: ".25",
          stream: true
        }),
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
      setMessages(prev => [...prev, {
        role: "assistant",
        content: finalMessage,
        timestamp: Date.now()
      }])

    // Only clear the streaming message after adding it to messages

    setCurrentStreamingMessage("")


    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, there was an error processing your request.",
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    setMessages([])
    setInput("")
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 h-full pb-8">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Bot className="w-16 h-16 text-primary" />
            <h2 className="text-2xl font-semibold">Welcome to dotAI Assistant</h2>
            <p className="text-muted-foreground max-w-md">
              I can answer your questions about the dotCMS platform. Here are some example questions:
            </p>
            <div className="space-y-2 text-left w-full max-w-md">
              <div className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70" 
                   onClick={() => handleExampleClick("What are the system requirements for dotCMS?")}>
                &quot;What are the system requirements for dotCMS?&quot;
              </div>
              <div className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70"
                   onClick={() => handleExampleClick("How do I create a new content type in dotCMS?")}>
                &quot;How do I create a new content type in dotCMS?&quot;
              </div>
              <div className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70"
                   onClick={() => handleExampleClick("How do I search content using rest api??")}>
                &quot;How do I search content using the rest api?&quot;
              </div>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-4 rounded-lg p-4",
              message.role === "user" 
                ? "bg-muted/50" 
                : "bg-primary/10"
            )}
          >
            {message.role === "user" ? (
              <UserCircle className="w-8 h-8" />
            ) : (
              <Bot className="w-8 h-8" />
            )}
            <div className="flex-1 space-y-2 overflow-hidden">
              <p className="text-sm font-medium">
                {message.role === "user" ? "You" : "dotAI Assistant"}
              </p>
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
                            <CopyButton />
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
            </div>
          </div>
        ))}
        
        {currentStreamingMessage && (
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
                      return !inline && match ? (
                        <div className="relative">
                          <CopyButton />
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

      <div className="sticky bottom-0 left-0 right-0 bg-background border-t">
        <div className="p-4 space-y-4">
          <form ref={formRef} onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              id="dotAIChatInput"
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
            </Button>
          </form>
          

            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                disabled={loading || messages.length === 0}
                onClick={clearHistory}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
     
        </div>
      </div>
    </div>
  )
} 