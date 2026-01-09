'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, StickyNote, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface NotesPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  notes: string | null
  onSave: (notes: string | null) => void
  elementType: 'card' | 'group'
  thumbnailUrl?: string | null
}

export function NotesPanel({
  isOpen,
  onClose,
  title,
  notes,
  onSave,
  elementType,
  thumbnailUrl,
}: NotesPanelProps) {
  const [editedNotes, setEditedNotes] = useState(notes || '')
  const [isDirty, setIsDirty] = useState(false)

  // Sync with external notes changes
  useEffect(() => {
    setEditedNotes(notes || '')
    setIsDirty(false)
  }, [notes])

  const handleSave = useCallback(() => {
    const trimmedNotes = editedNotes.trim()
    onSave(trimmedNotes || null)
    setIsDirty(false)
  }, [editedNotes, onSave])

  const handleClose = useCallback(() => {
    if (isDirty) {
      // Auto-save on close
      handleSave()
    }
    onClose()
  }, [isDirty, handleSave, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to save and close
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSave()
      onClose()
    }
    // Escape to close (auto-saves if dirty)
    if (e.key === 'Escape') {
      handleClose()
    }
  }, [handleSave, handleClose, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative bg-[#f5f2ed] border border-[#d0c8ba] rounded-xl shadow-2xl",
          "w-full max-w-md mx-4 overflow-hidden",
          "animate-in zoom-in-95 fade-in duration-200"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[#d0c8ba]">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=""
              className="w-10 h-10 rounded-md object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-[#e8e0d4] flex items-center justify-center flex-shrink-0">
              <StickyNote className="w-5 h-5 text-[#6b635a]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-[#1a1816] truncate">
              {title}
            </h3>
            <p className="text-xs text-[#6b635a]">
              {elementType === 'card' ? 'Card notes' : 'Group notes'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md hover:bg-[#e8e0d4] transition-colors"
          >
            <X className="w-4 h-4 text-[#6b635a]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <Textarea
            value={editedNotes}
            onChange={(e) => {
              setEditedNotes(e.target.value)
              setIsDirty(true)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Add your notes here..."
            className={cn(
              "min-h-[200px] resize-none",
              "bg-white border-[#d0c8ba] text-[#1a1816]",
              "placeholder:text-[#a09890]",
              "focus-visible:ring-amber-400 focus-visible:border-amber-400"
            )}
            autoFocus
          />

          {/* Helper text */}
          <p className="mt-2 text-xs text-[#a09890]">
            Press <kbd className="px-1 py-0.5 bg-[#e8e0d4] rounded text-[10px]">⌘ Enter</kbd> to save
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#d0c8ba] bg-[#f0ebe2]">
          <div className="flex items-center gap-2 text-xs text-[#6b635a]">
            {isDirty && (
              <>
                <Sparkles className="w-3 h-3" />
                <span>Unsaved changes</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-[#6b635a] hover:text-[#1a1816] hover:bg-[#e8e0d4]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                handleSave()
                onClose()
              }}
              disabled={!isDirty}
              className="bg-[#1a1816] text-[#e8e0d4] hover:bg-[#2a2826] disabled:opacity-50"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
