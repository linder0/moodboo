'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { ReferenceCard } from '@/lib/types'
import { ExternalLink } from 'lucide-react'

interface CardNodeData {
  card: ReferenceCard
}

export const CardNode = memo(function CardNode({ data }: NodeProps) {
  const { card } = data as CardNodeData

  return (
    <div className="group relative">
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#555] !border-2 !border-[#333] opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#555] !border-2 !border-[#333] opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-[#555] !border-2 !border-[#333] opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-[#555] !border-2 !border-[#333] opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* Card content */}
      <div className="w-[240px] bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg overflow-hidden shadow-lg hover:border-[#4a4a4a] transition-colors">
        {/* Thumbnail */}
        {card.thumbnail_url ? (
          <div className="aspect-[4/3] bg-[#222] relative overflow-hidden">
            <img
              src={card.thumbnail_url}
              alt={card.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
            {card.source_url && (
              <a
                href={card.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5 text-white" />
              </a>
            )}
          </div>
        ) : (
          <div className="aspect-[4/3] bg-[#222] flex items-center justify-center">
            <span className="text-[#555] text-sm">No image</span>
          </div>
        )}

        {/* Title */}
        <div className="p-3">
          <h3 className="text-white/90 text-sm font-medium truncate">
            {card.title}
          </h3>
          {card.notes && (
            <p className="text-white/40 text-xs mt-1 line-clamp-2">
              {card.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  )
})
