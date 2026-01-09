'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Board, ReferenceCard, CardAnalysis } from '@/lib/types'
import { ensureCardPosition } from '@/lib/utils'
import { toast } from 'sonner'

interface BoardWithData extends Board {
  cards: ReferenceCard[]
}

interface UseBoardDataReturn {
  board: BoardWithData | null
  isLoading: boolean
  updateBoardTitle: (title: string) => Promise<void>
  addCard: (card: ReferenceCard) => void
  updateCardAnalysis: (cardId: string, analysis: CardAnalysis | null) => void
  updateCardDimensions: (cardId: string, width: number, height: number) => void
  removeCard: (cardId: string) => void
}

export function useBoardData(boardId: string): UseBoardDataReturn {
  const router = useRouter()
  const [board, setBoard] = useState<BoardWithData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch board data
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
        ...ensureCardPosition(card, index),
      }))

      setBoard({
        ...data,
        cards: cardsWithPositions,
      })
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

  // Update board title
  const updateBoardTitle = useCallback(async (title: string) => {
    if (!title.trim() || title === board?.title) {
      return
    }

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      })

      if (!response.ok) throw new Error('Failed to update title')

      setBoard(prev => prev ? { ...prev, title: title.trim() } : null)
    } catch (error) {
      console.error('Error updating title:', error)
      toast.error('Failed to update title')
      throw error
    }
  }, [board?.title, boardId])

  // Add a card to the board
  const addCard = useCallback((card: ReferenceCard) => {
    setBoard(prev => prev ? { ...prev, cards: [...prev.cards, card] } : null)
  }, [])

  // Update card analysis
  const updateCardAnalysis = useCallback((cardId: string, analysis: CardAnalysis | null) => {
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

  // Update card dimensions
  const updateCardDimensions = useCallback((cardId: string, width: number, height: number) => {
    setBoard(prev => prev ? {
      ...prev,
      cards: prev.cards.map(c =>
        c.id === cardId ? { ...c, width, height } : c
      )
    } : null)
  }, [])

  // Remove a card
  const removeCard = useCallback((cardId: string) => {
    setBoard(prev => prev ? {
      ...prev,
      cards: prev.cards.filter(c => c.id !== cardId)
    } : null)
  }, [])

  return {
    board,
    isLoading,
    updateBoardTitle,
    addCard,
    updateCardAnalysis,
    updateCardDimensions,
    removeCard,
  }
}
