'use client'

import { memo, useState, useEffect, useRef, useCallback } from 'react'
import { NodeProps, useUpdateNodeInternals } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { Trash2, GripVertical } from 'lucide-react'

// Note colors with their background and text colors
export const NOTE_COLORS = {
  cream: { bg: '#f5f2ed', text: '#1a1816', border: '#d0c8ba' },
  yellow: { bg: '#fef9c3', text: '#713f12', border: '#fde047' },
  green: { bg: '#dcfce7', text: '#14532d', border: '#86efac' },
  blue: { bg: '#dbeafe', text: '#1e3a8a', border: '#93c5fd' },
  pink: { bg: '#fce7f3', text: '#831843', border: '#f9a8d4' },
  purple: { bg: '#f3e8ff', text: '#581c87', border: '#d8b4fe' },
  orange: { bg: '#ffedd5', text: '#7c2d12', border: '#fdba74' },
} as const

export type NoteColor = keyof typeof NOTE_COLORS

export interface TextNodeData {
  text: string
  color: NoteColor
  onTextChange?: (nodeId: string, text: string) => void
  onColorChange?: (nodeId: string, color: NoteColor) => void
  onDelete?: (nodeId: string) => void
}

const MIN_WIDTH = 150
const MIN_HEIGHT = 80
const DEFAULT_WIDTH = 200
const DEFAULT_HEIGHT = 120

export const TextNode = memo(function TextNode({ id, data, selected }: NodeProps) {
  const { text, color, onTextChange, onColorChange, onDelete } = data as unknown as TextNodeData
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(text || '')
  const [dimensions, setDimensions] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const updateNodeInternals = useUpdateNodeInternals()

  const colorScheme = NOTE_COLORS[color] || NOTE_COLORS.cream

  // Sync text when data changes
  useEffect(() => {
    setEditedText(text || '')
  }, [text])

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  const handleSave = useCallback(() => {
    setIsEditing(false)
    if (onTextChange && editedText !== text) {
      onTextChange(id, editedText)
    }
  }, [id, editedText, text, onTextChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditedText(text || '')
      setIsEditing(false)
    }
    // Cmd/Ctrl + Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSave()
    }
    // Stop propagation to prevent React Flow shortcuts
    e.stopPropagation()
  }, [text, handleSave])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }, [])

  return (
    <div
      className={cn(
        "group relative rounded-lg shadow-sm transition-all duration-200",
        selected && "ring-2 ring-[#1a1816] ring-offset-2 ring-offset-[#e8e0d4]"
      )}
      style={{
        width: dimensions.width,
        minHeight: dimensions.height,
        backgroundColor: colorScheme.bg,
        borderWidth: 1,
        borderColor: colorScheme.border,
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Drag handle */}
      <div className="absolute top-0 left-0 right-0 h-6 cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4" style={{ color: colorScheme.text, opacity: 0.4 }} />
      </div>

      {/* Delete button */}
      {selected && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(id)
          }}
          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors z-10"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}

      {/* Content */}
      <div className="p-3 pt-6">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Type your note..."
            className={cn(
              "w-full min-h-[60px] resize-none bg-transparent border-0 outline-none",
              "text-sm leading-relaxed placeholder:opacity-50 nodrag"
            )}
            style={{ color: colorScheme.text }}
          />
        ) : (
          <p
            className={cn(
              "text-sm leading-relaxed whitespace-pre-wrap break-words",
              !text && "opacity-50 italic"
            )}
            style={{ color: colorScheme.text }}
          >
            {text || 'Double-click to edit...'}
          </p>
        )}
      </div>

      {/* Color picker - show on hover/selected */}
      {(selected) && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-white rounded-full shadow-lg border border-[#d0c8ba]">
          {(Object.keys(NOTE_COLORS) as NoteColor[]).map((colorKey) => (
            <button
              key={colorKey}
              onClick={(e) => {
                e.stopPropagation()
                if (onColorChange) {
                  onColorChange(id, colorKey)
                }
              }}
              className={cn(
                "w-5 h-5 rounded-full transition-transform hover:scale-110",
                color === colorKey && "ring-2 ring-offset-1 ring-[#1a1816]"
              )}
              style={{ backgroundColor: NOTE_COLORS[colorKey].bg, borderColor: NOTE_COLORS[colorKey].border, borderWidth: 1 }}
            />
          ))}
        </div>
      )}
    </div>
  )
})
