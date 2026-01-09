'use client'

import { memo, useState, useCallback } from 'react'
import { NodeProps, NodeResizer, useUpdateNodeInternals } from '@xyflow/react'
import { CardGroup } from '@/lib/types'
import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Trash2,
  Lock,
  Unlock,
  Palette,
  StickyNote,
  Ungroup,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GROUP_COLORS, GROUP_COLOR_OPTIONS, GroupColor } from '@/lib/design-tokens'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface GroupNodeData {
  group: CardGroup
  cardCount: number
  onUpdate?: (groupId: string, updates: Partial<CardGroup>) => void
  onDelete?: (groupId: string) => void
  onUngroup?: (groupId: string) => void
  onOpenNotes?: (groupId: string) => void
}

export const GroupNode = memo(function GroupNode({ data, selected }: NodeProps) {
  const { group, cardCount, onUpdate, onDelete, onUngroup, onOpenNotes } = data as unknown as GroupNodeData
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(group.title)
  const updateNodeInternals = useUpdateNodeInternals()

  const colors = GROUP_COLORS[group.color] || GROUP_COLORS.neutral

  const handleTitleSave = useCallback(() => {
    if (editedTitle.trim() && editedTitle !== group.title) {
      onUpdate?.(group.id, { title: editedTitle.trim() })
    } else {
      setEditedTitle(group.title)
    }
    setIsEditingTitle(false)
  }, [editedTitle, group.id, group.title, onUpdate])

  const handleToggleCollapse = useCallback(() => {
    onUpdate?.(group.id, { collapsed: !group.collapsed })
    // Update node size after collapse
    setTimeout(() => updateNodeInternals(group.id), 0)
  }, [group.id, group.collapsed, onUpdate, updateNodeInternals])

  const handleColorChange = useCallback((color: GroupColor) => {
    onUpdate?.(group.id, { color })
  }, [group.id, onUpdate])

  const handleToggleLock = useCallback(() => {
    onUpdate?.(group.id, { locked: !group.locked })
  }, [group.id, group.locked, onUpdate])

  // Collapsed state shows only header
  if (group.collapsed) {
    return (
      <div
        className={cn(
          "rounded-lg border-2 shadow-sm transition-all duration-200",
          selected && "ring-2 ring-offset-2 ring-blue-500"
        )}
        style={{
          backgroundColor: colors.header,
          borderColor: colors.border,
          width: group.width,
          height: 48,
        }}
      >
        <GroupHeader
          group={group}
          colors={colors}
          cardCount={cardCount}
          isEditingTitle={isEditingTitle}
          editedTitle={editedTitle}
          setEditedTitle={setEditedTitle}
          setIsEditingTitle={setIsEditingTitle}
          handleTitleSave={handleTitleSave}
          handleToggleCollapse={handleToggleCollapse}
          handleColorChange={handleColorChange}
          handleToggleLock={handleToggleLock}
          onDelete={onDelete}
          onUngroup={onUngroup}
          onOpenNotes={onOpenNotes}
        />
      </div>
    )
  }

  return (
    <>
      {/* Resizer - only when not locked */}
      {!group.locked && (
        <NodeResizer
          minWidth={200}
          minHeight={150}
          isVisible={selected}
          lineClassName="!border-blue-400"
          handleClassName="!w-2.5 !h-2.5 !bg-blue-500 !border-white"
        />
      )}

      <div
        className={cn(
          "rounded-lg border-2 shadow-sm transition-all duration-200 overflow-hidden",
          selected && "ring-2 ring-offset-2 ring-blue-500"
        )}
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          width: group.width,
          height: group.height,
        }}
      >
        {/* Header */}
        <GroupHeader
          group={group}
          colors={colors}
          cardCount={cardCount}
          isEditingTitle={isEditingTitle}
          editedTitle={editedTitle}
          setEditedTitle={setEditedTitle}
          setIsEditingTitle={setIsEditingTitle}
          handleTitleSave={handleTitleSave}
          handleToggleCollapse={handleToggleCollapse}
          handleColorChange={handleColorChange}
          handleToggleLock={handleToggleLock}
          onDelete={onDelete}
          onUngroup={onUngroup}
          onOpenNotes={onOpenNotes}
        />

        {/* Content area - cards will be positioned inside via React Flow's parent/child relationship */}
        <div
          className="relative"
          style={{ height: group.height - 48 }}
        >
          {/* Drop zone indicator */}
          {cardCount === 0 && (
            <div className="absolute inset-4 border-2 border-dashed rounded-lg flex items-center justify-center"
              style={{ borderColor: colors.border }}
            >
              <span className="text-sm" style={{ color: colors.text, opacity: 0.5 }}>
                Drag cards here
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  )
})

// Separated header component for reuse in collapsed/expanded states
interface GroupHeaderProps {
  group: CardGroup
  colors: { bg: string; border: string; text: string; header: string }
  cardCount: number
  isEditingTitle: boolean
  editedTitle: string
  setEditedTitle: (title: string) => void
  setIsEditingTitle: (editing: boolean) => void
  handleTitleSave: () => void
  handleToggleCollapse: () => void
  handleColorChange: (color: GroupColor) => void
  handleToggleLock: () => void
  onDelete?: (groupId: string) => void
  onUngroup?: (groupId: string) => void
  onOpenNotes?: (groupId: string) => void
}

function GroupHeader({
  group,
  colors,
  cardCount,
  isEditingTitle,
  editedTitle,
  setEditedTitle,
  setIsEditingTitle,
  handleTitleSave,
  handleToggleCollapse,
  handleColorChange,
  handleToggleLock,
  onDelete,
  onUngroup,
  onOpenNotes,
}: GroupHeaderProps) {
  return (
    <div
      className="h-12 px-3 flex items-center gap-2 border-b"
      style={{ backgroundColor: colors.header, borderColor: colors.border }}
    >
      {/* Collapse toggle */}
      <button
        onClick={handleToggleCollapse}
        className="p-1 rounded hover:bg-black/5 transition-colors nodrag"
      >
        {group.collapsed ? (
          <ChevronRight className="w-4 h-4" style={{ color: colors.text }} />
        ) : (
          <ChevronDown className="w-4 h-4" style={{ color: colors.text }} />
        )}
      </button>

      {/* Title */}
      {isEditingTitle ? (
        <input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTitleSave()
            if (e.key === 'Escape') {
              setEditedTitle(group.title)
              setIsEditingTitle(false)
            }
          }}
          autoFocus
          className="flex-1 text-sm font-medium bg-transparent border-0 outline-none px-0 nodrag"
          style={{ color: colors.text }}
        />
      ) : (
        <button
          onClick={() => setIsEditingTitle(true)}
          className="flex-1 text-left text-sm font-medium truncate hover:underline nodrag"
          style={{ color: colors.text }}
        >
          {group.title}
        </button>
      )}

      {/* Card count badge */}
      <span
        className="px-2 py-0.5 text-xs font-medium rounded-full"
        style={{ backgroundColor: colors.border, color: colors.text }}
      >
        {cardCount}
      </span>

      {/* Lock indicator */}
      {group.locked && (
        <Lock className="w-3.5 h-3.5" style={{ color: colors.text, opacity: 0.5 }} />
      )}

      {/* Notes indicator */}
      {group.notes && (
        <StickyNote className="w-3.5 h-3.5" style={{ color: colors.text, opacity: 0.5 }} />
      )}

      {/* Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-1 rounded opacity-50 hover:opacity-100 hover:bg-black/5 transition-all nodrag"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" style={{ color: colors.text }} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg">
          {/* Notes */}
          <DropdownMenuItem
            onClick={() => onOpenNotes?.(group.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <StickyNote className="w-4 h-4" />
            {group.notes ? 'Edit notes' : 'Add notes'}
          </DropdownMenuItem>

          {/* Color picker */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48 p-2 bg-white">
              <div className="grid grid-cols-6 gap-1">
                {GROUP_COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={cn(
                      "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
                      group.color === color && "ring-2 ring-offset-1 ring-blue-500"
                    )}
                    style={{
                      backgroundColor: GROUP_COLORS[color].bg,
                      borderColor: GROUP_COLORS[color].border,
                    }}
                    title={color}
                  />
                ))}
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Lock/Unlock */}
          <DropdownMenuItem
            onClick={handleToggleLock}
            className="flex items-center gap-2 cursor-pointer"
          >
            {group.locked ? (
              <>
                <Unlock className="w-4 h-4" />
                Unlock group
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Lock group
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Ungroup */}
          <DropdownMenuItem
            onClick={() => onUngroup?.(group.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Ungroup className="w-4 h-4" />
            Ungroup cards
          </DropdownMenuItem>

          {/* Delete */}
          <DropdownMenuItem
            onClick={() => onDelete?.(group.id)}
            className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
