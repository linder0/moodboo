'use client'

import { useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { ReferenceCard } from '@/lib/types'
import { FlowCanvas } from '@/components/canvas/flow-canvas'
import { AddReferencePanel } from '@/components/editor/add-reference-panel'
import { toast } from 'sonner'
import { Loader2, Check, Pencil, Share2, ImagePlus } from 'lucide-react'
import { cn, getCardDimensions } from '@/lib/utils'
import { CanvasSidebar, CanvasTool } from '@/components/canvas/canvas-toolbar'
import {
  useBoardData,
  useCanvasShortcuts,
  useClipboardPaste,
  useDebouncedCardUpdate,
  useImageDrop,
  usePreventBrowserZoom,
} from '@/hooks'

export default function BoardEditorPage() {
  const params = useParams()
  const boardId = params.id as string

  // Custom hooks
  const {
    board,
    isLoading,
    updateBoardTitle,
    addCard,
    updateCardAnalysis,
    updateCardDimensions,
    removeCard,
  } = useBoardData(boardId)

  const { updateCard } = useDebouncedCardUpdate()
  usePreventBrowserZoom()

  // UI state
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [highlightedCardIds] = useState<string[]>([])
  const [activeTool, setActiveTool] = useState<CanvasTool>('select')

  // Viewport tracking for positioning new cards
  const viewportRef = useRef({ x: 0, y: 0, zoom: 1 })

  const getViewportCenter = useCallback(() => {
    const { x: vpX, y: vpY, zoom } = viewportRef.current
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800
    const centerX = (-vpX + windowWidth / 2) / zoom
    const centerY = (-vpY + windowHeight / 2) / zoom
    const offsetX = (Math.random() - 0.5) * 100
    const offsetY = (Math.random() - 0.5) * 100
    return {
      x: Math.round(centerX + offsetX),
      y: Math.round(centerY + offsetY),
    }
  }, [])

  const screenToCanvasPosition = useCallback((clientX: number, clientY: number) => {
    const { x: vpX, y: vpY, zoom } = viewportRef.current
    return {
      x: Math.round((clientX - vpX) / zoom),
      y: Math.round((clientY - vpY) / zoom),
    }
  }, [])

  // Clipboard paste and drag-drop for images
  useClipboardPaste({
    boardId,
    enabled: !isLoading && !!board,
    onCardCreated: addCard,
    onCardAnalyzed: updateCardAnalysis,
    getViewportCenter,
  })

  const { isDragging } = useImageDrop({
    boardId,
    enabled: !isLoading && !!board,
    onCardCreated: addCard,
    onCardAnalyzed: updateCardAnalysis,
    getDropPosition: screenToCanvasPosition,
  })

  useCanvasShortcuts({ activeTool, setActiveTool, setShowAddPanel })

  // Event handlers
  const handleToolChange = useCallback((tool: CanvasTool) => {
    setActiveTool(tool)
    setShowAddPanel(tool === 'add')
  }, [])

  const handleCloseAddPanel = useCallback(() => {
    setShowAddPanel(false)
    setActiveTool('select')
  }, [])

  const handleTitleSave = async () => {
    if (!editedTitle.trim() || editedTitle === board?.title) {
      setIsEditingTitle(false)
      setEditedTitle(board?.title || '')
      return
    }

    try {
      await updateBoardTitle(editedTitle.trim())
      setIsEditingTitle(false)
    } catch {
      setEditedTitle(board?.title || '')
      setIsEditingTitle(false)
    }
  }

  const handleCardCreated = (card: ReferenceCard) => {
    const dimensions = getCardDimensions(card.type, card.source, !!card.thumbnail_url)
    const { x: vpX, y: vpY, zoom } = viewportRef.current
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800
    const centerX = (-vpX + windowWidth / 2) / zoom - dimensions.width / 2
    const centerY = (-vpY + windowHeight / 2) / zoom - dimensions.height / 2
    const offsetX = (Math.random() - 0.5) * 100
    const offsetY = (Math.random() - 0.5) * 100

    const hasThumbnail = !!card.thumbnail_url
    const position = {
      x: Math.round(centerX + offsetX),
      y: Math.round(centerY + offsetY),
      width: hasThumbnail ? 0 : dimensions.width,
      height: hasThumbnail ? 0 : dimensions.height,
    }

    const newCard: ReferenceCard = { ...card, ...position }
    addCard(newCard)
    setShowAddPanel(false)
    setActiveTool('select')
    updateCard(card.id, position, 'init')
  }

  const handleCardPositionChange = useCallback((cardId: string, x: number, y: number) => {
    updateCard(cardId, { x, y }, 'position')
  }, [updateCard])

  const handleCardResize = useCallback((cardId: string, width: number, height: number) => {
    updateCardDimensions(cardId, width, height)
    updateCard(cardId, { width, height }, 'resize')
  }, [updateCard, updateCardDimensions])

  const handleCardDelete = useCallback(async (cardId: string) => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete card')
      removeCard(cardId)
    } catch (error) {
      console.error('Failed to delete card:', error)
    }
  }, [removeCard])

  const handleViewportChange = useCallback((viewport: { x: number; y: number; zoom: number }) => {
    viewportRef.current = viewport
  }, [])

  const handleConnectionCreate = useCallback(async (fromId: string, toId: string) => {
    try {
      await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board_id: boardId, from_card_id: fromId, to_card_id: toId }),
      })
    } catch (error) {
      console.error('Failed to save connection:', error)
    }
  }, [boardId])

  // Sync edited title when board loads
  if (board && !editedTitle && !isEditingTitle) {
    setEditedTitle(board.title)
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-[#e8e0d4] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6b635a]" />
      </div>
    )
  }

  if (!board) return null

  return (
    <div className="h-screen w-screen bg-[#e8e0d4] overflow-hidden relative">
      {/* Canvas */}
      <FlowCanvas
        cards={board.cards}
        highlightedCardIds={highlightedCardIds}
        activeTool={activeTool}
        onCardPositionChange={handleCardPositionChange}
        onCardResize={handleCardResize}
        onCardDelete={handleCardDelete}
        onConnectionCreate={handleConnectionCreate}
        onViewportChange={handleViewportChange}
      />

      {/* Sidebar with integrated Add panel */}
      <CanvasSidebar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        showAddPanel={showAddPanel}
        onCloseAddPanel={handleCloseAddPanel}
        addPanelContent={
          <AddReferencePanel
            boardId={boardId}
            onCardCreated={handleCardCreated}
            onCardAnalyzed={updateCardAnalysis}
          />
        }
      />

      {/* Header */}
      <div className="absolute top-4 left-4 z-[100]">
        <div className="flex items-center bg-[#f5f2ed] border border-[#d0c8ba] rounded-lg shadow-sm p-1">
          <div
            className={cn("px-2 py-1 w-[180px] group", !isEditingTitle && "cursor-pointer")}
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
                  <span className="text-sm font-medium text-[#1a1816] truncate">{board.title}</span>
                  <Pencil className="h-3 w-3 flex-shrink-0 text-[#a09890] opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </div>
          </div>
          <div className="w-px h-5 bg-[#d0c8ba] mx-1" />
          <button
            onClick={() => toast.info('Share feature coming soon!')}
            title="Share"
            className="h-8 w-8 flex items-center justify-center rounded-md transition-colors text-[#6b635a] hover:bg-[#e8e0d4]"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Drop overlay for drag-and-drop */}
      {isDragging && (
        <div className="absolute inset-0 z-[200] bg-[#1a1816]/60 backdrop-blur-sm flex items-center justify-center pointer-events-none animate-in fade-in duration-150">
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-dashed border-white/60 flex items-center justify-center">
              <ImagePlus className="w-10 h-10" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Drop images here</p>
              <p className="text-sm text-white/70">Release to add to your moodboard</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
