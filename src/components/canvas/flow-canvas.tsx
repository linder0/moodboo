'use client'

import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  NodeTypes,
  ReactFlowProvider,
  useReactFlow,
  useStore,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ReferenceCard } from '@/lib/types'
import { CardNode } from './card-node'
import { ReactiveGrid } from './reactive-grid'

interface FlowCanvasProps {
  cards: ReferenceCard[]
  highlightedCardIds?: string[]
  onCardPositionChange?: (cardId: string, x: number, y: number) => void
  onConnectionCreate?: (fromId: string, toId: string) => void
}

// Define custom node types
const nodeTypes: NodeTypes = {
  card: CardNode,
}

// Custom background that uses React Flow viewport
function ReactiveBackground() {
  // Subscribe to viewport changes from React Flow store
  const transform = useStore((state) => state.transform)
  const [x, y, zoom] = transform

  return (
    <ReactiveGrid
      zoom={zoom}
      offsetX={x}
      offsetY={y}
      dotSpacing={32}
      dotSize={1.2}
      glowRadius={150}
    />
  )
}

// Inner component that contains the ReactFlow
function FlowCanvasInner({ cards, highlightedCardIds = [], onCardPositionChange, onConnectionCreate }: FlowCanvasProps) {
  // Convert cards to React Flow nodes
  const initialNodes: Node[] = useMemo(() =>
    cards.map((card, index) => ({
      id: card.id,
      type: 'card',
      position: {
        x: card.x ?? 100 + (index % 4) * 280,
        y: card.y ?? 100 + Math.floor(index / 4) * 320,
      },
      data: {
        card,
        isHighlighted: highlightedCardIds.includes(card.id),
      },
    })),
    [cards, highlightedCardIds]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#666', strokeWidth: 2 },
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

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDragStop={onNodeDragStop}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.1}
      maxZoom={2}
      defaultEdgeOptions={{
        type: 'smoothstep',
        style: { stroke: '#666', strokeWidth: 2 },
      }}
      proOptions={{ hideAttribution: true }}
      style={{ background: 'transparent' }}
    >
      {/* Reactive grid rendered inside ReactFlow so it can access viewport */}
      <ReactiveBackground />

      <Controls
        className="!bg-[#2a2a2a] !border-[#3a3a3a] !rounded-lg [&>button]:!bg-[#2a2a2a] [&>button]:!border-[#3a3a3a] [&>button]:!text-white [&>button:hover]:!bg-[#3a3a3a]"
      />
      <MiniMap
        className="!bg-[#2a2a2a] !border-[#3a3a3a] !rounded-lg"
        nodeColor="#444"
        maskColor="rgba(0,0,0,0.8)"
      />
    </ReactFlow>
  )
}

export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <div className="absolute inset-0 bg-[#1a1a1a]">
      <ReactFlowProvider>
        <FlowCanvasInner {...props} />
      </ReactFlowProvider>
    </div>
  )
}
