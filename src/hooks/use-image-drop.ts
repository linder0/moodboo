'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ReferenceCard } from '@/lib/types'
import { toast } from 'sonner'

interface UseImageDropOptions {
  boardId: string
  enabled?: boolean
  onCardCreated: (card: ReferenceCard) => void
  onCardAnalyzed?: (cardId: string, analysis: ReferenceCard['analysis']) => void
  getDropPosition?: (clientX: number, clientY: number) => { x: number; y: number }
}

interface UseImageDropReturn {
  isDragging: boolean
}

/**
 * Hook to handle drag-and-drop of images onto the canvas.
 */
export function useImageDrop({
  boardId,
  enabled = true,
  onCardCreated,
  onCardAnalyzed,
  getDropPosition,
}: UseImageDropOptions): UseImageDropReturn {
  const [isDragging, setIsDragging] = useState(false)
  const isUploadingRef = useRef(false)
  const dragCounterRef = useRef(0)

  const uploadImage = useCallback(async (file: File, clientX: number, clientY: number) => {
    if (isUploadingRef.current) return
    isUploadingRef.current = true

    const toastId = toast.loading('Uploading image...')

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
        title: file.name.replace(/\.[^/.]+$/, '') || `Dropped image`,
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

      // Get drop position if available
      if (getDropPosition) {
        const position = getDropPosition(clientX, clientY)
        const positionedCard = {
          ...card,
          x: position.x,
          y: position.y,
        }

        // Save position
        await fetch(`/api/cards/${card.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: position.x, y: position.y }),
        })

        onCardCreated(positionedCard)
      } else {
        onCardCreated(card)
      }

      toast.success('Image added!', { id: toastId })
    } catch (error) {
      console.error('Error dropping image:', error)
      toast.error('Failed to add image', { id: toastId })
    } finally {
      isUploadingRef.current = false
    }
  }, [boardId, onCardCreated, getDropPosition])

  const handleDragEnter = useCallback((e: DragEvent) => {
    if (!enabled) return
    e.preventDefault()
    e.stopPropagation()

    dragCounterRef.current++

    // Check if dragging files
    if (e.dataTransfer?.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [enabled])

  const handleDragLeave = useCallback((e: DragEvent) => {
    if (!enabled) return
    e.preventDefault()
    e.stopPropagation()

    dragCounterRef.current--

    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [enabled])

  const handleDragOver = useCallback((e: DragEvent) => {
    if (!enabled) return
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [enabled])

  const handleDrop = useCallback(async (e: DragEvent) => {
    if (!enabled) return
    e.preventDefault()
    e.stopPropagation()

    dragCounterRef.current = 0
    setIsDragging(false)

    const files = e.dataTransfer?.files
    if (!files || files.length === 0) return

    // Filter for images only
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      toast.error('Please drop image files')
      return
    }

    // Upload each image
    for (const file of imageFiles) {
      await uploadImage(file, e.clientX, e.clientY)
    }
  }, [enabled, uploadImage])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [enabled, handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

  return { isDragging }
}
