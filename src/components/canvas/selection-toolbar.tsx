'use client'

import { Group, Ungroup, Trash2, StickyNote, Copy, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SelectionToolbarProps {
  selectedCount: number
  hasSelectedCards: boolean
  hasSelectedGroups: boolean
  canGroup: boolean // 2+ cards, no groups
  onGroup: () => void
  onUngroup: () => void
  onDelete: () => void
  onAddNotes: () => void
  onDuplicate?: () => void
  onCreateConnection?: () => void
}

export function SelectionToolbar({
  selectedCount,
  hasSelectedCards,
  hasSelectedGroups,
  canGroup,
  onGroup,
  onUngroup,
  onDelete,
  onAddNotes,
  onDuplicate,
  onCreateConnection,
}: SelectionToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1.5",
          "bg-[#1a1816] rounded-lg shadow-lg",
          "animate-in fade-in slide-in-from-bottom-2 duration-200"
        )}
      >
        {/* Selection count */}
        <div className="px-2 py-1 text-xs font-medium text-[#a09890]">
          {selectedCount} selected
        </div>

        <div className="w-px h-5 bg-[#3a3836] mx-1" />

        {/* Group - only if 2+ cards selected and no groups */}
        {canGroup && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onGroup}
                className="h-8 w-8 p-0 text-[#e8e0d4] hover:text-white hover:bg-[#3a3836]"
              >
                <Group className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#1a1816] text-[#e8e0d4] border-[#3a3836]">
              <p>Group cards</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Ungroup - only if groups selected */}
        {hasSelectedGroups && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onUngroup}
                className="h-8 w-8 p-0 text-[#e8e0d4] hover:text-white hover:bg-[#3a3836]"
              >
                <Ungroup className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#1a1816] text-[#e8e0d4] border-[#3a3836]">
              <p>Ungroup</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Add Notes - only for single selection */}
        {selectedCount === 1 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddNotes}
                className="h-8 w-8 p-0 text-[#e8e0d4] hover:text-white hover:bg-[#3a3836]"
              >
                <StickyNote className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#1a1816] text-[#e8e0d4] border-[#3a3836]">
              <p>Add notes</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Connect - only for exactly 2 cards */}
        {hasSelectedCards && selectedCount === 2 && onCreateConnection && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCreateConnection}
                className="h-8 w-8 p-0 text-[#e8e0d4] hover:text-white hover:bg-[#3a3836]"
              >
                <Link2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#1a1816] text-[#e8e0d4] border-[#3a3836]">
              <p>Connect cards</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Duplicate */}
        {onDuplicate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDuplicate}
                className="h-8 w-8 p-0 text-[#e8e0d4] hover:text-white hover:bg-[#3a3836]"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#1a1816] text-[#e8e0d4] border-[#3a3836]">
              <p>Duplicate</p>
            </TooltipContent>
          </Tooltip>
        )}

        <div className="w-px h-5 bg-[#3a3836] mx-1" />

        {/* Delete */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/30"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-[#1a1816] text-[#e8e0d4] border-[#3a3836]">
            <p>Delete</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
