'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  NodeTypes,
  ReactFlowProvider,
  useStore,
  useReactFlow,
  Panel,
  Viewport,
  SelectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ReferenceCard } from '@/lib/types'
import { CanvasTool } from './canvas-toolbar'
import { CardNode } from './card-node'
import { TextNode, NoteColor } from './text-node'
import { ReactiveGrid, GridPattern } from './reactive-grid'
import { Grid3X3, Circle, Minus, Plus, Maximize2, Map, ChevronDown, Check } from 'lucide-react'
import { cn, getDefaultCardPosition } from '@/lib/utils'
import { EDGE_STYLE } from '@/lib/design-tokens'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FlowCanvasProps {
  cards: ReferenceCard[]
  highlightedCardIds?: string[]
  activeTool?: CanvasTool
  onCardPositionChange?: (cardId: string, x: number, y: number) => void
  onCardResize?: (cardId: string, width: number, height: number) => void
  onCardDelete?: (cardId: string) => void
  onConnectionCreate?: (fromId: string, toId: string) => void
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void
  onTextNoteCreate?: (x: number, y: number) => void
  onFrameCreate?: (x: number, y: number, width: number, height: number) => void
}

// Define custom node types
const nodeTypes: NodeTypes = {
  card: CardNode,
  text: TextNode,
}

// Edge style imported from design-tokens

// Toolbar separator component
function ToolbarSeparator() {
  return <div className="w-px h-5 bg-[#d0c8ba] mx-1" />
}

// Custom background that uses React Flow viewport
function ReactiveBackground({ pattern }: { pattern: GridPattern }) {
  // Subscribe to viewport changes from React Flow store
  const transform = useStore((state) => state.transform)
  const [x, y, zoom] = transform

  return (
    <>
      <ReactiveGrid
        pattern={pattern}
        zoom={zoom}
        offsetX={x}
        offsetY={y}
        spacing={32}
      />
    </>
  )
}

// Clean toolbar button - no framework styling conflicts
function ToolbarButton({
  onClick,
  active,
  title,
  children
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "h-8 w-8 flex items-center justify-center rounded-md transition-colors",
        active
          ? "bg-[#1a1816] text-[#f5f2ed]"
          : "text-[#6b635a] hover:bg-[#e8e0d4]"
      )}
    >
      {children}
    </button>
  )
}

// Miro-style Canvas Toolbar (bottom-right)
function CanvasToolbar({
  gridPattern,
  setGridPattern,
  showMinimap,
  setShowMinimap,
}: {
  gridPattern: GridPattern
  setGridPattern: (pattern: GridPattern) => void
  showMinimap: boolean
  setShowMinimap: (show: boolean) => void
}) {
  const { zoomIn, zoomOut, fitView, zoomTo } = useReactFlow()
  const transform = useStore((state) => state.transform)
  const zoom = transform[2]
  const percentage = Math.round(zoom * 100)

  const patternOptions = [
    { value: 'dots' as GridPattern, label: 'Dots', icon: Circle },
    { value: 'grid' as GridPattern, label: 'Grid', icon: Grid3X3 },
    { value: 'none' as GridPattern, label: 'None', icon: null },
  ]

  const currentPattern = patternOptions.find(p => p.value === gridPattern)
  const CurrentIcon = currentPattern?.icon

  return (
    <div className="flex items-end gap-3">
      {/* Pattern dropdown - matches main controls bar styling */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="group flex items-center w-[100px] h-10 p-1 bg-[#f5f2ed] border border-[#d0c8ba] rounded-lg shadow-sm text-[#6b635a] transition-colors">
            <div className="flex items-center justify-between w-full h-full px-2 rounded-md group-hover:bg-[#e8e0d4] group-data-[state=open]:bg-[#e8e0d4] transition-colors">
              <div className="flex items-center gap-2">
                {CurrentIcon && <CurrentIcon className="h-4 w-4" />}
                <span className="text-[13px] font-medium">{currentPattern?.label}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[100px] min-w-[100px] bg-[#f5f2ed] border-[#d0c8ba] p-1">
          {patternOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setGridPattern(option.value)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[#6b635a] hover:text-[#1a1816] hover:bg-[#e8e0d4] focus:bg-[#e8e0d4] focus:text-[#1a1816] cursor-pointer"
            >
              {option.icon && <option.icon className="h-4 w-4" />}
              {!option.icon && <div className="w-4" />}
              <span className="text-[13px]">{option.label}</span>
              {gridPattern === option.value && (
                <Check className="h-3.5 w-3.5 ml-auto" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Main controls - fixed width to match minimap */}
      <div className="flex items-center justify-between h-10 bg-[#f5f2ed] border border-[#d0c8ba] rounded-lg px-1 shadow-sm w-[220px]">
        <ToolbarButton
          onClick={() => setShowMinimap(!showMinimap)}
          active={showMinimap}
          title="Toggle minimap"
        >
          <Map className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton onClick={() => zoomOut()} title="Zoom out">
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <button
          onClick={() => zoomTo(1)}
          title="Reset to 100%"
          className="w-12 h-8 flex items-center justify-center rounded-md text-[#6b635a] hover:bg-[#e8e0d4] hover:text-[#1a1816] transition-colors"
        >
          <span className="text-[13px] font-medium tabular-nums">
            {percentage}%
          </span>
        </button>

        <ToolbarButton onClick={() => zoomIn()} title="Zoom in">
          <Plus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton onClick={() => fitView({ padding: 0.2 })} title="Fit to screen">
          <Maximize2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  )
}

// Inner component that contains the ReactFlow
function FlowCanvasInner({ cards, highlightedCardIds = [], activeTool = 'select', onCardPositionChange, onCardResize, onCardDelete, onConnectionCreate, onViewportChange, onTextNoteCreate, onFrameCreate }: FlowCanvasProps) {
  const [gridPattern, setGridPattern] = useState<GridPattern>('dots')
  const [showMinimap, setShowMinimap] = useState(true)
  const { screenToFlowPosition } = useReactFlow()

  // Local state for text notes (not persisted to DB yet)
  const [textNotes, setTextNotes] = useState<Node[]>([])

  // Convert cards to React Flow nodes
  const initialNodes: Node[] = useMemo(() =>
    cards.map((card, index) => {
      const defaults = getDefaultCardPosition(index)
      return {
        id: card.id,
        type: 'card',
        position: {
          x: card.x ?? defaults.x,
          y: card.y ?? defaults.y,
        },
        data: {
          card,
          isHighlighted: highlightedCardIds.includes(card.id),
          onDelete: onCardDelete,
        },
      }
    }),
    [cards, highlightedCardIds, onCardDelete]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Sync nodes when cards prop changes (e.g., when new cards are added via paste/drop)
  useEffect(() => {
    setNodes((currentNodes) => {
      const currentCardIds = new Set(currentNodes.filter(n => n.type === 'card').map(n => n.id))
      const newCardIds = new Set(cards.map(c => c.id))

      // Find cards that need to be added
      const cardsToAdd = cards.filter(card => !currentCardIds.has(card.id))

      // Find nodes that need to be removed (cards that were deleted)
      const nodesToKeep = currentNodes.filter(node => {
        if (node.type !== 'card') return true // Keep non-card nodes (text notes, frames)
        return newCardIds.has(node.id)
      })

      // Update existing card nodes with new data (e.g., highlight state)
      const updatedNodes = nodesToKeep.map(node => {
        if (node.type !== 'card') return node
        const card = cards.find(c => c.id === node.id)
        if (!card) return node
        return {
          ...node,
          data: {
            ...node.data,
            card,
            isHighlighted: highlightedCardIds.includes(card.id),
            onDelete: onCardDelete,
            onResize: onCardResize,
          },
        }
      })

      // Add new cards
      const newNodes = cardsToAdd.map((card, index) => {
        const defaults = getDefaultCardPosition(cards.indexOf(card))
        return {
          id: card.id,
          type: 'card',
          position: {
            x: card.x ?? defaults.x,
            y: card.y ?? defaults.y,
          },
          data: {
            card,
            isHighlighted: highlightedCardIds.includes(card.id),
            onDelete: onCardDelete,
            onResize: onCardResize,
          },
        }
      })

      return [...updatedNodes, ...newNodes]
    })
  }, [cards, highlightedCardIds, onCardDelete, setNodes])

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({
        ...params,
        type: 'smoothstep',
        animated: true,
        style: EDGE_STYLE,
      }, eds))

      if (onConnectionCreate && params.source && params.target) {
        onConnectionCreate(params.source, params.target)
      }
    },
    [setEdges, onConnectionCreate]
  )

  // Handle node drag end - save position
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onCardPositionChange) {
        onCardPositionChange(node.id, node.position.x, node.position.y)
      }
    },
    [onCardPositionChange]
  )

  // Handle node resize end - save dimensions
  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes)

      // Check for resize end events
      for (const change of changes) {
        if (change.type === 'dimensions' && change.resizing === false && change.dimensions) {
          if (onCardResize) {
            onCardResize(change.id, change.dimensions.width, change.dimensions.height)
          }
        }
      }
    },
    [onNodesChange, onCardResize]
  )

  // Handle viewport changes (pan/zoom)
  const handleMove = useCallback(
    (_event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
      if (onViewportChange) {
        onViewportChange(viewport)
      }
    },
    [onViewportChange]
  )

  // Handle text note text changes
  const handleTextChange = useCallback((nodeId: string, text: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, text } }
          : node
      )
    )
  }, [setNodes])

  // Handle text note color changes
  const handleColorChange = useCallback((nodeId: string, color: NoteColor) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, color } }
          : node
      )
    )
  }, [setNodes])

  // Handle text note deletion
  const handleTextNoteDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
  }, [setNodes])

  // Handle pane click based on active tool
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool === 'select' || activeTool === 'add' || activeTool === 'connector') {
        return // Default behavior or no action
      }

      // Convert screen position to flow position
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      if (activeTool === 'text') {
        // Create a new text note at click position
        const newNote: Node = {
          id: `text-${Date.now()}`,
          type: 'text',
          position,
          data: {
            text: '',
            color: 'cream',
            onTextChange: handleTextChange,
            onColorChange: handleColorChange,
            onDelete: handleTextNoteDelete,
          },
        }
        setNodes((nds) => [...nds, newNote])

        if (onTextNoteCreate) {
          onTextNoteCreate(position.x, position.y)
        }
      }

      if (activeTool === 'frame') {
        // Create a simple frame at click position
        // For now, create a fixed-size frame - drag-to-resize can be added later
        const newFrame: Node = {
          id: `frame-${Date.now()}`,
          type: 'group',
          position,
          style: {
            width: 400,
            height: 300,
            backgroundColor: 'rgba(232, 224, 212, 0.5)',
            border: '2px dashed #d0c8ba',
            borderRadius: 12,
          },
          data: { label: 'Frame' },
        }
        setNodes((nds) => [...nds, newFrame])

        if (onFrameCreate) {
          onFrameCreate(position.x, position.y, 400, 300)
        }
      }
    },
    [activeTool, screenToFlowPosition, setNodes, handleTextChange, handleColorChange, handleTextNoteDelete, onTextNoteCreate, onFrameCreate]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDragStop={onNodeDragStop}
      onMove={handleMove}
      onPaneClick={handlePaneClick}
      nodeTypes={nodeTypes}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      minZoom={0.1}
      maxZoom={2}
      // Omnidirectional scroll panning
      panOnScroll
      panOnScrollSpeed={1.5}
      // Zoom with ctrl/cmd + scroll
      zoomOnScroll
      // Selection drag (box select) - disabled in connector mode
      selectionOnDrag={activeTool === 'select'}
      selectionMode={SelectionMode.Partial}
      // Enable click-to-connect when in connector mode
      connectOnClick={activeTool === 'connector'}
      // Allow panning by dragging canvas
      panOnDrag={activeTool === 'connector' ? false : [1, 2]} // Disable pan drag in connector mode
      defaultEdgeOptions={{
        type: 'smoothstep',
        style: EDGE_STYLE,
      }}
      proOptions={{ hideAttribution: true }}
      style={{
        background: 'transparent',
        cursor: activeTool === 'connector' ? 'crosshair' :
                activeTool === 'text' ? 'text' :
                activeTool === 'frame' ? 'crosshair' : 'default'
      }}
    >
      {/* Reactive grid rendered inside ReactFlow so it can access viewport */}
      <ReactiveBackground pattern={gridPattern} />

      {/* Miro-style bottom-right toolbar with minimap */}
      <Panel position="bottom-right" className="!mb-3 !mr-3">
        <div className="flex flex-col items-end gap-2">
          {/* Minimap - slides up with animation */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-200 ease-out",
              showMinimap
                ? "max-h-[160px] opacity-100"
                : "max-h-0 opacity-0"
            )}
          >
            <div className="bg-[#f5f2ed] border border-[#d0c8ba] rounded-lg shadow-sm p-2 w-[220px]">
              <MiniMap
                pannable
                zoomable
                style={{
                  position: 'relative',
                  width: 204,
                  height: 125,
                  margin: 0,
                }}
                className="!bg-[#e8e0d4] !rounded-md !border-0"
                nodeColor="#c5bdb0"
                maskColor="rgba(232, 224, 212, 0.8)"
              />
            </div>
          </div>

          {/* Toolbar */}
          <CanvasToolbar
            gridPattern={gridPattern}
            setGridPattern={setGridPattern}
            showMinimap={showMinimap}
            setShowMinimap={setShowMinimap}
          />
        </div>
      </Panel>
    </ReactFlow>
  )
}

export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <div className="absolute inset-0 bg-[#e8e0d4]">
      <ReactFlowProvider>
        <FlowCanvasInner {...props} />
      </ReactFlowProvider>
    </div>
  )
}
