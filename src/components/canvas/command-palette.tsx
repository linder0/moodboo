'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChatResponse, ReferenceCard } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  Command,
  Sparkles,
  Send,
  Loader2,
  X,
  Palette,
  Sun,
  MessageSquare,
  Lightbulb,
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  boardId: string
  cards: ReferenceCard[]
  onHighlightCards?: (cardIds: string[]) => void
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  actions?: ChatResponse['actions']
  timestamp: Date
}

const SUGGESTED_PROMPTS = [
  { icon: Palette, text: "What's the dominant color palette?" },
  { icon: Sun, text: "Describe the lighting style" },
  { icon: MessageSquare, text: "How would you describe this aesthetic?" },
  { icon: Lightbulb, text: "What's missing from this board?" },
]

export function CommandPalette({
  isOpen,
  onOpenChange,
  boardId,
  cards,
  onHighlightCards,
}: CommandPaletteProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = useCallback(async (query?: string) => {
    const message = query || input.trim()
    if (!message || isLoading) return

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId, message }),
      })

      if (!response.ok) {
        throw new Error('Chat request failed')
      }

      const data: ChatResponse = await response.json()

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        actions: data.actions,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Handle actions
      if (data.actions?.highlightCardIds?.length) {
        onHighlightCards?.(data.actions.highlightCardIds)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, boardId, onHighlightCards])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const analyzedCount = cards.filter((c) => c.analysis !== null).length

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 bg-card/95 backdrop-blur-xl border-border/50 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>
            Ask questions about your moodboard using natural language
          </DialogDescription>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-muted/50 rounded-lg">
            <Command className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">K</span>
          </div>
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your moodboard..."
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
              disabled={isLoading}
            />
          </div>
          {input && !isLoading && (
            <button
              onClick={() => handleSubmit()}
              className="p-1.5 hover:bg-muted rounded-md transition-colors"
            >
              <Send className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          )}
        </div>

        {/* Messages / Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {messages.length === 0 ? (
            // Empty state with suggestions
            <div className="p-4 space-y-4">
              {/* Board context */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {analyzedCount} of {cards.length} cards analyzed
                </span>
              </div>

              {/* Suggested prompts */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Try asking
                </p>
                <div className="grid gap-2">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmit(prompt.text)}
                      className="flex items-center gap-3 px-3 py-2.5 text-left bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors group"
                      disabled={isLoading}
                    >
                      <prompt.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {prompt.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat messages
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-4 py-2.5',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {/* Action indicators */}
                    {message.actions?.highlightCardIds?.length ? (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <p className="text-xs text-muted-foreground">
                          Highlighted {message.actions.highlightCardIds.length} cards
                        </p>
                      </div>
                    ) : null}

                    {message.actions?.generatedContent ? (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <p className="text-xs text-foreground/80 italic">
                          {message.actions.generatedContent}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="bg-muted/50 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Footer */}
        {messages.length > 0 && (
          <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
            <button
              onClick={() => setMessages([])}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <X className="w-3 h-3" />
              Clear chat
            </button>
            <span className="text-xs text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> to close
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
