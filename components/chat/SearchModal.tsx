"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { ChatComponent } from "../chat/ChatComponent"

export function SearchModal({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          dotAI Assistant
        </DialogTitle>
        <div className="flex-1 overflow-hidden">
          <ChatComponent />
        </div>
      </DialogContent>
    </Dialog>
  )
} 