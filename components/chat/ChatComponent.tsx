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
  mode?: "ai" | "search" // Track which mode the message was from
}

const RECENT_QUESTIONS_KEY = "recent-questions"
const MODE_STORAGE_KEY = "dotai-last-mode"
const API_KEY = Config.AuthToken;
const API_ENDPOINT = Config.DotCMSHost;

export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("")
  const [mode, setMode] = useState<"ai" | "search">(() => {
    // Try to get the last mode from localStorage, default to "search"
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY)
    return (savedMode === "ai" || savedMode === "search") ? savedMode : "search"
  })
  const [recentQuestions, setRecentQuestions] = useState<string[]>([])
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

  const PreDefinedQuestions = [
    "What are the system requirements for dotCMS?",
    "How do I create a new content type in dotCMS?",
    "How do I search content using rest api?",
  ] 
  
  // Load recent questions from storage
  useEffect(() => {
    const savedRecentQuestions = localStorage.getItem(RECENT_QUESTIONS_KEY)
    if (savedRecentQuestions) {
      setRecentQuestions(JSON.parse(savedRecentQuestions))
    }
  }, [])

  // Scroll for new messages based on mode
  useEffect(() => {
    if (messages.length > 0) {
      // Don't auto-scroll for search results, as they can be many
      if (mode === "ai" || !messages[messages.length - 1].isSearchResult) {
        scrollToBottom()
      }
    }
  }, [messages, mode])

  // Filter messages based on current mode
  const filteredMessages = messages.filter(msg => !msg.mode || msg.mode === mode)

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
    
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: inputTrimmed,
      timestamp: Date.now(),
      mode: "ai"
    }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    setInput("")

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    try {
      // Format chat history for context - only include AI conversation messages
      const aiConversation = messages.filter(msg => !msg.isSearchResult && (!msg.mode || msg.mode === "ai"));
      const chatHistory = aiConversation.map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`).join('\n');
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
        const messageChunks = chunk
          .split('\n')
          .filter(line => line.startsWith('data: '))
          .map(line => line.slice(6)) // Remove 'data: ' prefix

        if(chunk.includes("[DONE]")) {
          break;
        }

        for (const message of messageChunks) {
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
      
      // After streaming is complete, add the full message to the messages array
      setMessages(prev => [...prev, {
        role: "assistant",
        content: finalMessage,
        timestamp: Date.now(),
        mode: "ai"
      }])

      // Clear the streaming message after adding it
      setCurrentStreamingMessage("")
    } catch (error) {
      // Only show error if not aborted
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Error:', error)
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
          timestamp: Date.now(),
          mode: "ai"
        }])
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
    setMessages([])
    setInput("")
  }

  async function handleSearch(query: string) {
    setLoading(true)
    /*
    // Add user message for search
    setMessages(prev => [...prev, {
      role: "user",
      content: query,
      timestamp: Date.now(),
      mode: "search"
    }])
    
    */
    
    try {
      const response = await fetch(`${API_ENDPOINT}/api/v1/ai/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          indexName: "default",
          prompt: query,
          operator: "cosine",
          threshold: ".25",
          searchLimit: 10,
        }),
      })

      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      
      // Check if there are results
      if (!data.dotCMSResults || data.dotCMSResults.length === 0) {
        // Add a "no results" message
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "No search results found. Please try different keywords.",
          timestamp: Date.now(),
          mode: "search"
        }])
        return
      }
      
      // Format search results - include all content types
      const searchResults = data.dotCMSResults.map((result: any) => {
        // Ensure we have matches
        if (!result.matches || !result.matches.length) {
          return null
        }
        
        return {
          role: "assistant" as const,
          content: JSON.stringify({
            title: result.title || 'Untitled Result',
            matches: result.matches || [],
            content: result.matches[0]?.extractedText ? 
                     truncateText(result.matches[0].extractedText, 200) : 
                     "No preview available",
            inode: result.inode,
            url: result.urlMap || result.url || result.slug || result.urlTitle || "",
            score: result.matches[0]?.distance ? parseFloat(result.matches[0].distance) : 0,
            contentType: result.contentType || 'documentation',
            modDate: result.modDate,
          }),
          timestamp: Date.now(),
          isSearchResult: true,
          mode: "search" as const
        }
      }).filter(Boolean) // Remove any null items

      // Add search results to messages
      setMessages(prev => [...prev, ...searchResults])

      // Scroll to the last user message after adding search results
      setTimeout(() => {
        lastUserMessageRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, there was an error processing your search request.",
        timestamp: Date.now(),
        mode: "search"
      }])
    } finally {
      setLoading(false)
    }
  }

  // Store recent questions when a user asks something
  const storeRecentQuestion = (question: string) => {
    // Don't store empty questions
    if (!question.trim()) return

    setRecentQuestions(prev => {
      let updated: string[];
      // Only append if in a conversation (filteredMessages.length > 0 && mode === "ai")
      if (
        filteredMessages.length > 0 &&
        mode === "ai" &&
        prev.length > 0 &&
        !PreDefinedQuestions.includes(prev[0])
      ) {
        // Append the follow-up to the most recent question
        updated = [
          prev[0] + " " + question,
          ...prev.slice(1)
        ].slice(0, 5);
      } else {
        // Check if the question is in the predefined list
        if (PreDefinedQuestions.includes(question)) {
          updated = prev;
        } else if (prev.includes(question)) {
          // If the same question exists, remove it from its current position
          // and add it to the top of the history
          updated = [
            question,
            ...prev.filter(q => q !== question)
          ].slice(0, 5);
        } else {
          // Add new question to the top
          updated = [question, ...prev].slice(0, 5);
        }
      }
      localStorage.setItem(RECENT_QUESTIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if(loading) return;
    if (!input.trim()) return
    
    // Store the question
    storeRecentQuestion(input.trim())

    if (mode === "search") {
        setMessages([])
      await handleSearch(input.trim())
    } else {
      await sendMessage(e)
    }
  }


  const handleModeChange = (pressed: boolean) => {

    // Abort any ongoing streaming response
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }






    //setCurrentStreamingMessage("")
    //setMessages([])
    const newMode = pressed ? "search" : "ai"
    setMode(newMode)

    if(newMode === "search" && input.trim() == ""){
        setInput(recentQuestions[0])
        setTimeout(() => {
            //formRef.current?.requestSubmit();
        }, 100);
    }
    // Save the mode preference to localStorage
    localStorage.setItem(MODE_STORAGE_KEY, newMode)
    
    // Don't auto-submit when changing modes - let the user press Enter
  }

  const handleChatAboutResults = () => {
    
    handleModeChange(false)
    // Get the last user message (which should be the search query)
    const lastUserMessage = filteredMessages.findLast(m => m.role === "user")
    if (lastUserMessage) {
      setInput(lastUserMessage.content)
      // Submit the form after a short delay to ensure mode switch is complete
      setTimeout(() => {
        formRef.current?.requestSubmit()
      }, 100)
    }
  }

  return (
    <div className="flex flex-col h-full relative max-w-4xl mx-auto w-full">

      
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="p-2 sm:p-4 border-b flex gap-2 sm:gap-4 items-center"
      >
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            className="w-full p-2 pr-8 bg-background border rounded-md text-sm sm:text-base"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission on Enter key
                handleSubmit(e);
              }
            }}

            placeholder={mode === "search" 
                ? "Search the dev site..." 
                : filteredMessages.length > 0 && mode === "ai"
                    ? "Ask a follow up..." 
                    : "Ask a question..."}
            disabled={loading}
          />
          { (input ||filteredMessages.length > 0) && (
            <button
              type="button"
              onClick={clearHistory}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 text-muted-foreground" />}
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === "search" ? "default" : "secondary"}
            size="sm"
            onClick={() => handleModeChange(true)}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>

          <Button
            variant={mode === "ai" ? "default" : "secondary"}
            size="sm"
            onClick={() => handleModeChange(false)}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </Button>
        </div>
      </form>
      
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        {filteredMessages.length === 0 && (
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
                  I can answer your questions or help you find information about the dotCMS platform. Here are some previous questions:
                </p>
                <div className="space-y-2 text-left w-full max-w-md px-2 sm:px-0">
                  {(() => {
                    // Always show up to 5 questions total
                    const questionsToShow: string[] = [];
                    
                    // Add all recent questions first (up to 5)
                    if (recentQuestions.length > 0) {
                      recentQuestions.forEach(question => {
                        questionsToShow.push(question);
                      });
                    }
                    
                    // Fill remaining slots with predefined questions to reach a total of 5
                    if (questionsToShow.length < 5) {
                      // Filter out predefined questions that match recent ones to avoid duplicates
                      const filteredPredefined = PreDefinedQuestions.filter(
                        q => !questionsToShow.includes(q)
                      );
                      
                      // Add unique predefined questions to fill the remaining slots (up to 5 total)
                      filteredPredefined.slice(0, 5 - questionsToShow.length).forEach(question => {
                        questionsToShow.push(question);
                      });
                    }
                    
                    // Render the questions
                    return questionsToShow.map((question, index) => (
                      <div 
                        key={index}
                        className="flex items-start justify-between p-2 sm:p-3 rounded-lg bg-muted/50 text-sm sm:text-base mb-1"
                      >
                        <span
                          className="flex-1 cursor-pointer text-center"
                          onClick={() => handleExampleClick(question)}
                        >
                          {question}
                        </span>
                        {recentQuestions.includes(question) && !PreDefinedQuestions.includes(question) && (
                          <button
                            type="button"
                            className="ml-2 mt-0.5 p-1 hover:bg-muted rounded-full"
                            style={{ alignSelf: "flex-start" }}
                            onClick={e => {
                              e.stopPropagation();
                              setRecentQuestions(prev => {
                                const updated = prev.filter(q => q !== question);
                                localStorage.setItem(RECENT_QUESTIONS_KEY, JSON.stringify(updated));
                                return updated;
                              });
                            }}
                            aria-label="Remove from history"
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </>
        )}
        {filteredMessages.map((message, index) => (
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
        {mode === "search" && filteredMessages.length > 0 && filteredMessages.some(m => m.isSearchResult) && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleChatAboutResults}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Chat about these results
            </Button>
          </div>
        )}
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

    </div>
  )
}
