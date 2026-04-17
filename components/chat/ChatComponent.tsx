"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowUp,
  Sparkles,
  X,
  Copy,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { cn } from "@/util/utils";
import { CopyButton } from "@/components/chat/CopyButton";
import { Config } from "@/util/config";
import {
  formatDocSourcePath,
  sourceHrefToDisplay,
} from "@/components/chat/sourceLinks";

export type DocSource = {
  id: number;
  title: string;
  href: string;
  displayUrl: string;
};

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  sources?: DocSource[];
}

const RECENT_QUESTIONS_KEY = "recent-questions";
const API_KEY = Config.AuthToken;
const API_ENDPOINT = Config.DotCMSHost;

const PreDefinedQuestions = [
  "What are the system requirements for dotCMS?",
  "How do I create a new content type in dotCMS?",
  "How do I search content using rest api?",
];

/** Max sources shown under a reply (after filtering). Not the same as API `searchLimit`. */
const MAX_SOURCES = 4;

export type ChatComponentHandle = {
  reset: () => void;
};

type ChatComponentProps = {
  /** When the assistant panel opens, focus the input */
  isPanelOpen?: boolean;
};

/** Turn [1] [2] into markdown links so we can render numbered citation badges. */
function linkifyCitationMarkers(md: string): string {
  return md.replace(/\[(\d+)\](?!\()/g, (_m, num) => `[${num}](#cite-${num})`);
}

function CitationBadge({
  n,
  className,
}: {
  n: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[1.125rem] h-4 px-[3px] rounded border border-border/90 bg-muted text-[10px] font-semibold text-muted-foreground tabular-nums leading-none",
        className
      )}
    >
      {n}
    </span>
  );
}

function SourcesFooter({ sources }: { sources: DocSource[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="mt-5 pt-4 border-t border-border/50 space-y-3 min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Sources
      </p>
      <ul className="space-y-3 list-none m-0 p-0">
        {sources.map((s) => (
          <li key={`${s.id}-${s.href}`}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full gap-2.5 text-sm no-underline text-inherit rounded-md px-2 py-1.5 -mx-2 transition-colors hover:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <CitationBadge
                n={s.id}
                className="mt-0.5 shrink-0 transition-colors group-hover:bg-muted-foreground/22 group-hover:border-muted-foreground/30"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground leading-snug">{s.title}</p>
                <p className="text-xs text-muted-foreground break-all mt-0.5">
                  {s.displayUrl}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MessageActionsRow({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-0.5 mt-4 pt-3 border-t border-border/50 min-w-0">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-muted-foreground"
        aria-label="Copy response"
        onClick={copy}
      >
        <Copy className={cn("h-3.5 w-3.5 shrink-0", copied && "text-green-600")} />
        Copy
      </Button>
    </div>
  );
}

function AssistantMarkdown({ content }: { content: string }) {
  const prepared = linkifyCitationMarkers(content);

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        // Nested lists: prose stacks margin on `p` + margin on `ul`/`ol` — collapse to one tight gap
        "[&_li>p:has(+ul)]:mb-0 [&_li>p:has(+ol)]:mb-0",
        "[&_li>ul]:!mt-1.5 [&_li>ol]:!mt-1.5"
      )}
    >
      <ReactMarkdown
        components={{
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, "");

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
                    padding: "1rem",
                    maxWidth: "100%",
                    overflowX: "auto",
                    backgroundColor: "rgb(30, 41, 59)",
                    borderRadius: "0.5rem",
                  }}
                >
                  {codeContent}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            );
          },
          a: ({ href, children, ...props }: any) => {
            if (typeof href === "string" && href.startsWith("#cite-")) {
              const num = Number.parseInt(href.replace("#cite-", ""), 10);
              if (!Number.isNaN(num)) {
                return (
                  <CitationBadge n={num} className="mx-0.5 align-baseline" />
                );
              }
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {prepared}
      </ReactMarkdown>
    </div>
  );
}

/** Best embedding distance for a hit: lower = closer match (same as AI search `matches[].distance`). */
function bestMatchDistance(
  matches: { distance?: unknown }[] | undefined
): number {
  if (!matches?.length) return Number.POSITIVE_INFINITY;
  let best = Number.POSITIVE_INFINITY;
  for (const m of matches) {
    const d = m.distance;
    if (typeof d === "number" && !Number.isNaN(d) && d < best) best = d;
  }
  return best;
}

function mapSearchJsonToSources(data: unknown): DocSource[] {
  if (!data || typeof data !== "object") return [];
  const dotCMSResults = (data as { dotCMSResults?: unknown[] }).dotCMSResults;
  if (!Array.isArray(dotCMSResults)) return [];

  type Row = {
    distance: number;
    title: string;
    href: string;
    displayUrl: string;
  };

  const byHref = new Map<string, Row>();

  for (const raw of dotCMSResults) {
    const result = raw as Record<string, unknown>;
    const matches = result.matches as { distance?: unknown }[] | undefined;
    if (!matches?.length) continue;

    const rawUrl =
      (result.urlMap as string) ||
      (result.url as string) ||
      (result.slug as string) ||
      (result.urlTitle as string) ||
      "";
    if (typeof rawUrl === "string" && rawUrl.startsWith("/content.")) {
      continue;
    }

    const distance = bestMatchDistance(matches);
    const title = (result.title as string) || "Untitled";
    const contentType = (result.contentType as string) || "";
    const href = formatDocSourcePath(contentType, rawUrl);
    const displayUrl = sourceHrefToDisplay(href);

    const prev = byHref.get(href);
    if (!prev || distance < prev.distance) {
      byHref.set(href, { distance, title, href, displayUrl });
    }
  }

  const ranked = Array.from(byHref.values()).sort(
    (a, b) => a.distance - b.distance
  );

  return ranked.slice(0, MAX_SOURCES).map((row, i) => ({
    id: i + 1,
    title: row.title,
    href: row.href,
    displayUrl: row.displayUrl,
  }));
}

async function fetchSearchForSources(
  query: string,
  signal: AbortSignal
): Promise<unknown> {
  const response = await fetch(`${API_ENDPOINT}/api/v1/ai/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: Config.AIModel,
      indexName: "default",
      prompt: query,
      operator: "cosine",
      threshold: ".25",
      searchLimit: 20,
    }),
    signal,
  });
  if (!response.ok) throw new Error("Search request failed");
  return response.json();
}

export const ChatComponent = forwardRef<ChatComponentHandle, ChatComponentProps>(
  function ChatComponent({ isPanelOpen = true }, ref) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");
    const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");
    const [recentQuestions, setRecentQuestions] = useState<string[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (isPanelOpen) {
        inputRef.current?.focus();
      }
    }, [isPanelOpen]);

    useEffect(() => {
      const saved = localStorage.getItem(RECENT_QUESTIONS_KEY);
      if (saved) {
        try {
          setRecentQuestions(JSON.parse(saved));
        } catch {
          /* ignore */
        }
      }
    }, []);

    const scrollToBottom = useCallback(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
      if (messages.length > 0) scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
      if (currentStreamingMessage) scrollToBottom();
    }, [currentStreamingMessage, scrollToBottom]);

    useEffect(() => {
      if (loading && !currentStreamingMessage) scrollToBottom();
    }, [loading, currentStreamingMessage, scrollToBottom]);

    const clearHistory = useCallback(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setCurrentStreamingMessage("");
      setMessages([]);
      setInput("");
    }, []);

    useImperativeHandle(ref, () => ({ reset: clearHistory }), [clearHistory]);

    const handleExampleClick = (question: string) => {
      setInput(question);
      setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 100);
    };

    async function sendMessage(e: React.FormEvent) {
      e.preventDefault();
      if (!input.trim()) return;
      const inputTrimmed = input.trim();

      const userMessage: Message = {
        role: "user",
        content: inputTrimmed,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setInput("");
      setCurrentStreamingMessage("");

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const searchPromise = fetchSearchForSources(inputTrimmed, signal)
        .then((json) => mapSearchJsonToSources(json))
        .catch(() => [] as DocSource[]);

      try {
        const aiConversation = messages;
        const chatHistory = aiConversation
          .map(
            (msg) =>
              `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`
          )
          .join("\n");
        const fullPrompt = `${chatHistory}\nHuman: ${inputTrimmed}`;

        const response = await fetch(`${API_ENDPOINT}/api/v1/ai/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            indexName: "default",
            prompt: fullPrompt,
            model: Config.AIModel,
            temperature: "1",
            responseLengthTokens: "1500",
            operator: "cosine",
            threshold: ".25",
            stream: true,
          }),
          signal,
        });

        if (!response.ok) throw new Error("Network response was not ok");
        let finalMessage = "";
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let sseBuffer = "";

        const processSseLine = (rawLine: string) => {
          const trimmed = rawLine.trim();
          if (!trimmed.startsWith("data:")) return;

          const payload = trimmed.slice(5).replace(/^\s+/, "");
          if (payload === "" || payload === "[DONE]") return;

          try {
            const parsed = JSON.parse(payload);
            if (
              parsed.choices &&
              parsed.choices[0].delta &&
              parsed.choices[0].delta.content
            ) {
              setCurrentStreamingMessage(
                (prev) => prev + parsed.choices[0].delta.content
              );
              finalMessage = finalMessage + parsed.choices[0].delta.content;
            }
          } catch {
            // Malformed or partial JSON; skip this line.
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() ?? "";

          for (const line of lines) {
            processSseLine(line);
          }
        }

        if (sseBuffer.trim()) {
          processSseLine(sseBuffer);
        }

        const sources = await searchPromise;

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: finalMessage,
            timestamp: Date.now(),
            sources,
          },
        ]);

        setCurrentStreamingMessage("");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Error:", error);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Sorry, there was an error processing your request.",
              timestamp: Date.now(),
            },
          ]);
        }
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }

    const storeRecentQuestion = (question: string) => {
      if (!question.trim()) return;

      setRecentQuestions((prev) => {
        let updated: string[];
        if (
          messages.length > 0 &&
          prev.length > 0 &&
          !PreDefinedQuestions.includes(prev[0])
        ) {
          updated = [prev[0] + " " + question, ...prev.slice(1)].slice(0, 5);
        } else {
          if (PreDefinedQuestions.includes(question)) {
            updated = prev;
          } else if (prev.includes(question)) {
            updated = [question, ...prev.filter((q) => q !== question)].slice(
              0,
              5
            );
          } else {
            updated = [question, ...prev].slice(0, 5);
          }
        }
        localStorage.setItem(RECENT_QUESTIONS_KEY, JSON.stringify(updated));
        return updated;
      });
    };

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (loading) return;
      if (!input.trim()) return;
      storeRecentQuestion(input.trim());
      await sendMessage(e);
    }

    const showEmpty = messages.length === 0 && !currentStreamingMessage;

    return (
      <div className="flex flex-col h-full min-h-0 w-full">
        <div className="flex flex-1 min-h-0 flex-col overflow-y-auto px-4 rounded-lg">
          <p className="shrink-0 text-[11px] leading-relaxed text-muted-foreground/90 mb-4 px-0.5">
            Responses are generated using AI and may contain mistakes.
          </p>

          {showEmpty && !loading && (
            <>
              <div
                className="min-h-0 flex-1"
                aria-hidden
              />
              <div className="shrink-0 space-y-6 pb-2">
                <div>
                  <p className="text-sm text-foreground/90 mb-1">
                    Hi, I&apos;m an AI assistant with access to documentation
                    and other content.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tip: You can toggle this pane with{" "}
                    <kbd className="pointer-events-none inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
                      <span>⌘</span>
                      <span>/</span>
                    </kbd>{" "}
                    or{" "}
                    <kbd className="pointer-events-none inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
                      <span>⌘</span>
                      <span>K</span>
                    </kbd>
                    .
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Try asking
                  </p>
                  <div className="space-y-1.5">
                    {(() => {
                      const questionsToShow: string[] = [];
                      recentQuestions.forEach((q) => questionsToShow.push(q));
                      if (questionsToShow.length < 5) {
                        PreDefinedQuestions.filter(
                          (q) => !questionsToShow.includes(q)
                        )
                          .slice(0, 5 - questionsToShow.length)
                          .forEach((q) => questionsToShow.push(q));
                      }
                      return questionsToShow.map((question, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm"
                        >
                          <button
                            type="button"
                            className="flex-1 text-left text-foreground/90 hover:text-foreground transition-colors"
                            onClick={() => handleExampleClick(question)}
                          >
                            {question}
                          </button>
                          {recentQuestions.includes(question) &&
                            !PreDefinedQuestions.includes(question) && (
                              <button
                                type="button"
                                className="shrink-0 p-1 rounded-md hover:bg-muted"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRecentQuestions((prev) => {
                                    const updated = prev.filter(
                                      (q) => q !== question
                                    );
                                    localStorage.setItem(
                                      RECENT_QUESTIONS_KEY,
                                      JSON.stringify(updated)
                                    );
                                    return updated;
                                  });
                                }}
                                aria-label="Remove from history"
                              >
                                <X className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                            )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-0 pb-2">
            {messages.map((message, index) =>
              message.role === "user" ? (
                <div
                  key={`${message.timestamp}-${index}`}
                  className="py-4 border-b border-border/30"
                >
                  <div className="flex w-full flex-col items-end gap-1.5 text-right">
                    <p className="text-xs font-medium text-muted-foreground">
                      You
                    </p>
                    <p className="text-sm text-foreground/95 leading-relaxed rounded-2xl bg-muted/70 border border-border/50 px-3.5 py-2.5 w-fit max-w-[min(100%,85%)] text-left">
                      {message.content}
                    </p>
                  </div>
                </div>
              ) : (
                <article
                  key={`${message.timestamp}-${index}`}
                  className="py-5 border-b border-border/30 last:border-b-0"
                >
                  <div className="flex gap-3 items-start">
                    <Sparkles
                      className="h-4 w-4 text-primary shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Assistant
                      </p>
                      <AssistantMarkdown content={message.content} />
                    </div>
                  </div>
                  {message.sources && message.sources.length > 0 && (
                    <SourcesFooter sources={message.sources} />
                  )}
                  {message.content.trim() ? (
                    <MessageActionsRow text={message.content} />
                  ) : null}
                </article>
              )
            )}

            {loading && !currentStreamingMessage && (
              <div className="py-5 border-b border-border/30 border-dashed">
                <p className="text-sm text-muted-foreground/75">Thinking…</p>
              </div>
            )}

            {currentStreamingMessage && (
              <article className="py-5 border-b border-border/30 border-dashed">
                <div className="flex gap-3 items-start">
                  <Sparkles
                    className="h-4 w-4 text-primary shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Assistant
                    </p>
                    <AssistantMarkdown content={currentStreamingMessage} />
                  </div>
                </div>
              </article>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="shrink-0 pt-3"
        >
          <div className="relative rounded-2xl border border-border bg-muted/20 focus-within:ring-2 focus-within:ring-ring/30 focus-within:border-primary/30 transition-shadow">
            <textarea
              ref={inputRef}
              rows={2}
              className="w-full resize-none bg-transparent px-4 py-3 pr-14 text-sm outline-none placeholder:text-muted-foreground min-h-[3.25rem] max-h-40 rounded-2xl"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask AI a question…"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="absolute right-2 bottom-2 h-9 w-9 rounded-full shadow-sm"
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 px-0.5">
            <span className="opacity-80">Enter</span> to send ·{" "}
            <span className="opacity-80">Shift+Enter</span> for newline
          </p>
        </form>
      </div>
    );
  }
);
