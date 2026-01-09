'use client'

import { cn } from '@/lib/utils'
import {
  MousePointer2,
  Square,
  Type,
  Spline,
  ImagePlus,
  Undo2,
  Redo2,
  X,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Tool types for the canvas
export type CanvasTool = 'select' | 'frame' | 'text' | 'connector' | 'add'

interface CanvasSidebarProps {
  activeTool: CanvasTool
  onToolChange: (tool: CanvasTool) => void
  showAddPanel?: boolean
  onCloseAddPanel?: () => void
  addPanelContent?: React.ReactNode
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
}

interface ToolButtonProps {
  tool: CanvasTool
  activeTool: CanvasTool
  onToolChange: (tool: CanvasTool) => void
  icon: React.ReactNode
  label: string
  shortcut?: string
}

function ToolButton({ tool, activeTool, onToolChange, icon, label, shortcut }: ToolButtonProps) {
  const isActive = activeTool === tool

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onToolChange(tool)}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150",
            isActive
              ? "bg-[#1a1816] text-[#f5f2ed] shadow-sm"
              : "text-[#6b635a] hover:bg-[#e8e0d4] hover:text-[#1a1816]"
          )}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8} className="bg-[#1a1816] text-[#f5f2ed] border-0">
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {shortcut && (
            <kbd className="px-1.5 py-0.5 text-[10px] bg-[#2a2826] rounded">{shortcut}</kbd>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function ToolbarSeparator() {
  return <div className="h-px w-6 bg-[#d0c8ba] mx-auto my-1" />
}

function ActionButton({
  onClick,
  disabled,
  icon,
  label,
  shortcut
}: {
  onClick?: () => void
  disabled?: boolean
  icon: React.ReactNode
  label: string
  shortcut?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150",
            disabled
              ? "text-[#c5bdb0] cursor-not-allowed"
              : "text-[#6b635a] hover:bg-[#e8e0d4] hover:text-[#1a1816]"
          )}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8} className="bg-[#1a1816] text-[#f5f2ed] border-0">
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {shortcut && (
            <kbd className="px-1.5 py-0.5 text-[10px] bg-[#2a2826] rounded">{shortcut}</kbd>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

const TOOL_CONFIG: Omit<ToolButtonProps, 'activeTool' | 'onToolChange'>[] = [
  {
    tool: 'select',
    icon: <MousePointer2 className="w-5 h-5" />,
    label: 'Select',
    shortcut: 'V',
  },
  {
    tool: 'frame',
    icon: <Square className="w-5 h-5" />,
    label: 'Frame',
    shortcut: 'F',
  },
  {
    tool: 'text',
    icon: <Type className="w-5 h-5" />,
    label: 'Text / Note',
    shortcut: 'T',
  },
  {
    tool: 'connector',
    icon: <Spline className="w-5 h-5" />,
    label: 'Connector',
    shortcut: 'C',
  },
]

export function CanvasSidebar({
  activeTool,
  onToolChange,
  showAddPanel = false,
  onCloseAddPanel,
  addPanelContent,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: CanvasSidebarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[100] flex items-start gap-2">
        {/* Main toolbar */}
        <div className="flex flex-col gap-2">
          {/* Tools */}
          <div className="flex flex-col items-center gap-1 p-1.5 bg-[#f5f2ed] border border-[#d0c8ba] rounded-xl shadow-lg">
            {TOOL_CONFIG.map((toolProps) => (
              <ToolButton
                key={toolProps.tool}
                {...toolProps}
                activeTool={activeTool}
                onToolChange={onToolChange}
              />
            ))}

            <ToolbarSeparator />

            {/* Add Reference button */}
            <ToolButton
              tool="add"
              activeTool={activeTool}
              onToolChange={onToolChange}
              icon={<ImagePlus className="w-5 h-5" />}
              label="Add Reference"
              shortcut="A"
            />
          </div>

          {/* Undo/Redo */}
          <div className="flex flex-col items-center gap-1 p-1.5 bg-[#f5f2ed] border border-[#d0c8ba] rounded-xl shadow-lg">
            <ActionButton
              onClick={onUndo}
              disabled={!canUndo}
              icon={<Undo2 className="w-5 h-5" />}
              label="Undo"
              shortcut="⌘Z"
            />
            <ActionButton
              onClick={onRedo}
              disabled={!canRedo}
              icon={<Redo2 className="w-5 h-5" />}
              label="Redo"
              shortcut="⌘⇧Z"
            />
          </div>
        </div>

        {/* Add Reference Panel - slides out from sidebar */}
        {showAddPanel && addPanelContent && (
          <div className="w-72 animate-in slide-in-from-left-2 fade-in duration-200">
            <div className="bg-[#f5f2ed] border border-[#d0c8ba] rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#1a1816]">Add Reference</h3>
                <button
                  onClick={onCloseAddPanel}
                  className="p-1 rounded hover:bg-[#e8e0d4] text-[#6b635a]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {addPanelContent}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
