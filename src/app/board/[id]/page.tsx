'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Board, ReferenceCard, CardAnalysis } from '@/lib/types'
import { FlowCanvas } from '@/components/canvas/flow-canvas'
import { AddReferencePanel } from '@/components/editor/add-reference-panel'
import { AestheticWidget } from '@/components/canvas/aesthetic-widget'
import { CommandPalette } from '@/components/canvas/command-palette'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  Check,
  Pencil,
  Plus,
  X,
  Command
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BoardWithData extends Board {
  cards: ReferenceCard[]
}

export default function BoardEditorPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.id as string

  const [board, setBoard] = useState<BoardWithData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [highlightedCardIds, setHighlightedCardIds] = useState<string[]>([])

  // TODO: Re-enable Cmd+K shortcut when AI features are ready
  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (
  //       e.target instanceof HTMLInputElement ||
  //       e.target instanceof HTMLTextAreaElement
  //     ) {
  //       return
  //     }
  //     if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
  //       e.preventDefault()
  //       setShowCommandPalette(true)
  //     }
  //   }
  //   window.addEventListener('keydown', handleKeyDown)
  //   return () => window.removeEventListener('keydown', handleKeyDown)
  // }, [])

  const fetchBoard = useCallback(async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/')
          return
        }
        throw new Error('Failed to fetch board')
      }
      const data = await response.json()

      // Ensure cards have default canvas positions if not set
      const cardsWithPositions = (data.cards || []).map((card: ReferenceCard, index: number) => ({
        ...card,
        x: card.x ?? (100 + (index % 4) * 280),
        y: card.y ?? (100 + Math.floor(index / 4) * 320),
        width: card.width ?? 240,
        height: card.height ?? 280,
      }))

      setBoard({
        ...data,
        cards: cardsWithPositions,
      })
      setEditedTitle(data.title)
    } catch (error) {
      console.error('Error fetching board:', error)
      toast.error('Failed to load board')
    } finally {
      setIsLoading(false)
    }
  }, [boardId, router])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  const handleTitleSave = async () => {
    if (!editedTitle.trim() || editedTitle === board?.title) {
      setIsEditingTitle(false)
      setEditedTitle(board?.title || '')
      return
    }

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedTitle.trim() }),
      })

      if (!response.ok) throw new Error('Failed to update title')

      setBoard(prev => prev ? { ...prev, title: editedTitle.trim() } : null)
      setIsEditingTitle(false)
    } catch (error) {
      console.error('Error updating title:', error)
      toast.error('Failed to update title')
    }
  }

  const handleCardCreated = (card: ReferenceCard) => {
    const existingCards = board?.cards || []
    const newCard = {
      ...card,
      x: card.x ?? (100 + (existingCards.length % 4) * 280),
      y: card.y ?? (100 + Math.floor(existingCards.length / 4) * 320),
      width: card.width ?? 240,
      height: card.height ?? 280,
    }
    setBoard(prev => prev ? { ...prev, cards: [...prev.cards, newCard] } : null)
    setShowAddPanel(false)
  }

  // Called when a card's AI analysis completes
  const handleCardAnalyzed = useCallback((cardId: string, analysis: CardAnalysis | null) => {
    setBoard(prev => {
      if (!prev) return prev
      return {
        ...prev,
        cards: prev.cards.map(c =>
          c.id === cardId ? { ...c, analysis } : c
        ),
      }
    })
  }, [])

  // Handle highlighting cards from command palette
  const handleHighlightCards = useCallback((cardIds: string[]) => {
    setHighlightedCardIds(cardIds)
    // Clear highlights after 5 seconds
    setTimeout(() => setHighlightedCardIds([]), 5000)
  }, [])

  // Debounced position save
  const positionSaveTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const handleCardPositionChange = useCallback((cardId: string, x: number, y: number) => {
    // Debounce save
    const existing = positionSaveTimeouts.current.get(cardId)
    if (existing) clearTimeout(existing)

    const timeout = setTimeout(async () => {
      try {
        await fetch(`/api/cards/${cardId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x, y }),
        })
      } catch (error) {
        console.error('Failed to save position:', error)
      }
      positionSaveTimeouts.current.delete(cardId)
    }, 500)

    positionSaveTimeouts.current.set(cardId, timeout)
  }, [])

  const handleConnectionCreate = useCallback(async (fromId: string, toId: string) => {
    try {
      await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_id: boardId,
          from_card_id: fromId,
          to_card_id: toId,
        }),
      })
    } catch (error) {
      console.error('Failed to save connection:', error)
    }
  }, [boardId])

  if (isLoading) {
    return (
      <div className="h-screen bg-[#1a1a1a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    )
  }

  if (!board) {
    return null
  }

  return (
    <div className="h-screen w-screen bg-[#1a1a1a] overflow-hidden relative">
      {/* React Flow Canvas */}
      <FlowCanvas
        cards={board.cards}
        highlightedCardIds={highlightedCardIds}
        onCardPositionChange={handleCardPositionChange}
        onConnectionCreate={handleConnectionCreate}
      />

      {/* Floating Header */}
      <div className="absolute top-4 left-4 z-[100] flex items-center gap-3">
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-[#2a2a2a] border border-[#3a3a3a] text-white/70 hover:text-white hover:bg-[#3a3a3a]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-3 py-1.5">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave()
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false)
                    setEditedTitle(board.title)
                  }
                }}
                autoFocus
                className="h-6 text-sm bg-transparent border-none focus-visible:ring-0 px-0 text-white"
              />
              <Button size="icon" variant="ghost" onClick={handleTitleSave} className="h-5 w-5 text-white/50 hover:text-white">
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-2 group"
            >
              <span className="text-sm font-medium text-white/90">
                {board.title}
              </span>
              <Pencil className="h-3 w-3 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-2 py-1">
          <span className="text-xs text-white/50">
            {board.cards.length} {board.cards.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Floating Add Button */}
      <div className="absolute top-4 right-4 z-[100]">
        <Button
          onClick={() => setShowAddPanel(!showAddPanel)}
          size="sm"
          className={cn(
            "gap-1.5",
            showAddPanel
              ? "bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]"
              : "bg-white text-black hover:bg-white/90"
          )}
        >
          {showAddPanel ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddPanel ? 'Close' : 'Add'}
        </Button>
      </div>

      {/* Floating Add Panel */}
      {showAddPanel && (
        <div className="absolute top-16 right-4 z-[100] w-80 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-2xl p-4">
            <AddReferencePanel
              boardId={boardId}
              onCardCreated={handleCardCreated}
              onCardAnalyzed={handleCardAnalyzed}
            />
          </div>
        </div>
      )}

      {/* TODO: Re-enable AI features when ready */}
      {/* Command Palette Button */}
      {/* <button
        onClick={() => setShowCommandPalette(true)}
        className="absolute bottom-6 left-6 z-[100] flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white/60 hover:text-white hover:bg-[#3a3a3a] transition-colors"
      >
        <Command className="w-4 h-4" />
        <span className="text-sm">Ask AI</span>
        <kbd className="ml-2 px-1.5 py-0.5 bg-[#3a3a3a] rounded text-[10px] text-white/40">
          ⌘K
        </kbd>
      </button> */}

      {/* AI Aesthetic Widget */}
      {/* <AestheticWidget cards={board.cards} /> */}

      {/* Command Palette */}
      {/* <CommandPalette
        isOpen={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        boardId={boardId}
        cards={board.cards}
        onHighlightCards={handleHighlightCards}
      /> */}
    </div>
  )
}
