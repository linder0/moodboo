'use client'

import { useEffect, useCallback, useRef } from 'react'
import { ReferenceCard } from '@/lib/types'
import { toast } from 'sonner'

interface UseClipboardPasteOptions {
  boardId: string
  enabled?: boolean
  onCardCreated: (card: ReferenceCard) => void
  onCardAnalyzed?: (cardId: string, analysis: ReferenceCard['analysis']) => void
  getViewportCenter?: () => { x: number; y: number }
}

/**
 * Hook to handle clipboard paste events for images.
 * Supports pasting images from clipboard (Cmd+V / Ctrl+V).
 */
export function useClipboardPaste({
  boardId,
  enabled = true,
  onCardCreated,
  onCardAnalyzed,
  getViewportCenter,
}: UseClipboardPasteOptions) {
  const isUploadingRef = useRef(false)

  const uploadImage = useCallback(async (file: File) => {
    if (isUploadingRef.current) return
    isUploadingRef.current = true

    const toastId = toast.loading('Pasting image...')

    try {
      // Upload to storage
      const formData = new FormData()
      formData.append('file', file)
      formData.append('board_id', boardId)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error('Upload failed')
      }

      const { path, url } = await uploadRes.json()

      // Create card
      const cardData = {
        board_id: boardId,
        type: 'image',
        source: 'upload',
        title: `Pasted image ${new Date().toLocaleTimeString()}`,
        thumbnail_url: url,
        file_path: path,
      }

      const cardRes = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData),
      })

      if (!cardRes.ok) {
        throw new Error('Failed to create card')
      }

      const card = await cardRes.json()

      // If we have a viewport center function, calculate position
      if (getViewportCenter) {
        const center = getViewportCenter()
        const positionedCard = {
          ...card,
          x: center.x,
          y: center.y,
        }

        // Save position
        await fetch(`/api/cards/${card.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: center.x, y: center.y }),
        })

        onCardCreated(positionedCard)
      } else {
        onCardCreated(card)
      }

      toast.success('Image pasted!', { id: toastId })

      // Trigger AI analysis in background (if enabled)
      // triggerCardAnalysis(card.id, onCardAnalyzed)
    } catch (error) {
      console.error('Error pasting image:', error)
      toast.error('Failed to paste image', { id: toastId })
    } finally {
      isUploadingRef.current = false
    }
  }, [boardId, onCardCreated, getViewportCenter])

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (!enabled) return

    // Don't intercept paste in input fields
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    const clipboardData = e.clipboardData
    if (!clipboardData) return

    // Check for image files in clipboard
    const items = Array.from(clipboardData.items)
    const imageItem = items.find(item => item.type.startsWith('image/'))

    if (imageItem) {
      e.preventDefault()
      const file = imageItem.getAsFile()
      if (file) {
        await uploadImage(file)
      }
      return
    }

    // Check for image files (drag and dropped images sometimes come as files)
    const files = Array.from(clipboardData.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))

    if (imageFile) {
      e.preventDefault()
      await uploadImage(imageFile)
      return
    }

    // Check for HTML content with images (copied from web)
    const html = clipboardData.getData('text/html')
    if (html) {
      const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i)
      if (imgMatch && imgMatch[1]) {
        const imgUrl = imgMatch[1]
        // Only handle data URLs or blob URLs (actual image data)
        if (imgUrl.startsWith('data:image/') || imgUrl.startsWith('blob:')) {
          e.preventDefault()
          try {
            const response = await fetch(imgUrl)
            const blob = await response.blob()
            const file = new File([blob], 'pasted-image.png', { type: blob.type })
            await uploadImage(file)
          } catch (error) {
            console.error('Failed to fetch image from URL:', error)
          }
        }
      }
    }
  }, [enabled, uploadImage])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [enabled, handlePaste])
}
