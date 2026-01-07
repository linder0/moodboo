'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Board, ReferenceCard, CardAnalysis } from '@/lib/types'
import { FlowCanvas } from '@/components/canvas/flow-canvas'
import { AddReferencePanel } from '@/components/editor/add-reference-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Loader2,
  Check,
  Pencil,
  Plus,
  X,
  Share2,
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
  const [highlightedCardIds, setHighlightedCardIds] = useState<string[]>([])

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

  // Prevent browser zoom (ctrl+wheel) so only canvas zooms
  useEffect(() => {
    const preventZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }
    document.addEventListener('wheel', preventZoom, { passive: false })
    return () => document.removeEventListener('wheel', preventZoom)
  }, [])

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
      <div className="h-screen bg-[#e8e0d4] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6b635a]" />
      </div>
    )
  }

  if (!board) {
    return null
  }

  return (
    <div className="h-screen w-screen bg-[#e8e0d4] overflow-hidden relative">
      {/* React Flow Canvas */}
      <FlowCanvas
        cards={board.cards}
        highlightedCardIds={highlightedCardIds}
        onCardPositionChange={handleCardPositionChange}
        onConnectionCreate={handleConnectionCreate}
      />

      {/* Floating Header */}
      <div className="absolute top-4 left-4 z-[100]">
        <div className="flex items-center bg-[#f5f2ed] border border-[#d0c8ba] rounded-lg shadow-sm p-1">
          {/* Logo / Home Button */}
          <Link
            href="/"
            className="flex items-center justify-center h-8 w-8 bg-[#1a1816] hover:bg-[#2a2826] transition-colors rounded-md"
          >
            <span className="text-[#faf8f5] font-medium text-sm">M</span>
          </Link>

          {/* Separator */}
          <div className="w-px h-5 bg-[#d0c8ba] mx-1" />

          {/* Board Title */}
          <div
            className={cn(
              "px-2 py-1 w-[180px] group",
              !isEditingTitle && "cursor-pointer"
            )}
            onClick={() => !isEditingTitle && setIsEditingTitle(true)}
          >
            <div className="flex items-center justify-between w-full">
              {isEditingTitle ? (
                <>
                  <input
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
                    className="h-6 text-sm bg-transparent border-0 outline-none px-0 text-[#1a1816] flex-1"
                  />
                  <Check
                    className="h-3.5 w-3.5 flex-shrink-0 text-[#a09890] hover:text-[#1a1816] transition-colors cursor-pointer"
                    onClick={handleTitleSave}
                  />
                </>
              ) : (
                <>
                  <span className="text-sm font-medium text-[#1a1816] truncate">
                    {board.title}
                  </span>
                  <Pencil className="h-3 w-3 flex-shrink-0 text-[#a09890] opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="w-px h-5 bg-[#d0c8ba] mx-1" />

          {/* Share Button */}
          <button
            onClick={() => toast.info('Share feature coming soon!')}
            title="Share"
            className="h-8 w-8 flex items-center justify-center rounded-md transition-colors text-[#6b635a] hover:bg-[#e8e0d4]"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Floating Add Button */}
      <div className="absolute top-4 right-4 z-[100]">
        <Button
          onClick={() => setShowAddPanel(!showAddPanel)}
          size="sm"
          className={cn(
            "gap-1.5 shadow-sm",
            showAddPanel
              ? "bg-[#ddd4c6] text-[#1a1816] hover:bg-[#d0c8ba] border border-[#d0c8ba]"
              : "bg-[#1a1816] text-[#e8e0d4] hover:bg-[#2a2826]"
          )}
        >
          {showAddPanel ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddPanel ? 'Close' : 'Add'}
        </Button>
      </div>

      {/* Floating Add Panel */}
      {showAddPanel && (
        <div className="absolute top-16 right-4 z-[100] w-80 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="bg-[#f5f2ed] border border-[#d0c8ba] rounded-xl shadow-lg p-4">
            <AddReferencePanel
              boardId={boardId}
              onCardCreated={handleCardCreated}
              onCardAnalyzed={handleCardAnalyzed}
            />
          </div>
        </div>
      )}
    </div>
  )
}
