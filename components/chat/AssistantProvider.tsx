"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChatComponent,
  type ChatComponentHandle,
} from "@/components/chat/ChatComponent";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/util/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const WIDTH_NARROW = "min(26rem, 100vw)";
const WIDTH_EXPANDED = "min(42rem, 100vw)";
const LG_UP = "(min-width: 1024px)";

type AssistantContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
};

const AssistantContext = createContext<AssistantContextValue | null>(null);

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error("useAssistant must be used within AssistantProvider");
  }
  return ctx;
}

export function AssistantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const chatRef = useRef<ChatComponentHandle>(null);
  const isDesktop = useMediaQuery(LG_UP);

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  useEffect(() => {
    if (!isDesktop && open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isDesktop, open]);

  const toggleOpen = useCallback(() => {
    setOpen((o) => !o);
  }, []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggleOpen,
      expanded,
      setExpanded,
    }),
    [open, expanded, toggleOpen]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (mod && e.key === "/") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const padRight =
    !open || !isDesktop
      ? "0px"
      : expanded
        ? WIDTH_EXPANDED
        : WIDTH_NARROW;

  return (
    <AssistantContext.Provider value={value}>
      <div
        className="min-h-dvh min-w-0 transition-[padding-right] duration-300 ease-out"
        style={{ paddingRight: padRight }}
      >
        {children}
      </div>

      {open && !isDesktop ? (
        <button
          type="button"
          aria-label="Close assistant"
          className="fixed inset-0 z-[99] bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed flex flex-col bg-background",
          "transition-[transform,width] duration-300 ease-out",
          isDesktop
            ? [
                "inset-y-0 right-0 z-40 border-l border-border shadow-none",
                open
                  ? "translate-x-0"
                  : "translate-x-full pointer-events-none",
              ]
            : [
                "inset-x-0 bottom-0 top-16 z-[100] overflow-hidden rounded-t-3xl border border-border/70 shadow-2xl",
                "pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]",
                open
                  ? "translate-y-0"
                  : "translate-y-full pointer-events-none",
              ]
        )}
        style={
          isDesktop
            ? {
                width: expanded ? WIDTH_EXPANDED : WIDTH_NARROW,
              }
            : undefined
        }
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-semibold text-base tracking-tight truncate">
              Assistant
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 text-muted-foreground hover:text-foreground",
                !isDesktop && "hidden"
              )}
              onClick={() => setExpanded((e) => !e)}
              aria-label={expanded ? "Use narrow panel" : "Expand panel"}
            >
              {expanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => chatRef.current?.reset()}
              aria-label="Clear conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3 pb-5 pt-1 overflow-hidden">
          <ChatComponent ref={chatRef} isPanelOpen={open} />
        </div>
      </aside>
    </AssistantContext.Provider>
  );
}
