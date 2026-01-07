'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react'
import { ReferenceCard, CardSource } from '@/lib/types'
import { ExternalLink, Link2, Type } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardNodeData {
  card: ReferenceCard
  isHighlighted?: boolean
}

// Source icons and colors for link cards
const sourceConfig: Record<CardSource, { icon: string; color: string; bg: string }> = {
  instagram: { icon: '📷', color: '#E4405F', bg: '#FDF2F4' },
  pinterest: { icon: '📌', color: '#E60023', bg: '#FDF2F4' },
  tiktok: { icon: '🎵', color: '#000000', bg: '#F5F5F5' },
  youtube: { icon: '▶️', color: '#FF0000', bg: '#FEF2F2' },
  twitter: { icon: '𝕏', color: '#000000', bg: '#F5F5F5' },
  arena: { icon: '◯', color: '#1A1A1A', bg: '#F5F5F5' },
  notion: { icon: '📝', color: '#000000', bg: '#F5F5F5' },
  googledoc: { icon: '📄', color: '#4285F4', bg: '#EFF6FF' },
  web: { icon: '🌐', color: '#6B7280', bg: '#F3F4F6' },
  upload: { icon: '📁', color: '#6B7280', bg: '#F3F4F6' },
}

// Extract domain from URL for display
function getDomainFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export const CardNode = memo(function CardNode({ data, selected }: NodeProps) {
  const { card, isHighlighted } = data as CardNodeData
  const isLink = card.type === 'link'
  const isText = card.type === 'text'
  const sourceInfo = sourceConfig[card.source] || sourceConfig.web
  const domain = card.source_url ? getDomainFromUrl(card.source_url) : ''

  return (
    <div className="group relative">
      {/* Node resizer - only visible when selected */}
      <NodeResizer
        minWidth={150}
        minHeight={100}
        isVisible={selected}
        lineClassName="!border-[#c0b8aa]"
        handleClassName="!w-2.5 !h-2.5 !bg-[#f5f2ed] !border-2 !border-[#c0b8aa] !rounded-sm"
      />

      {/* Connection handles - z-20 to layer above card content */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#c0b8aa] !border-2 !border-[#f5f2ed] opacity-0 group-hover:opacity-100 transition-opacity !z-20"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#c0b8aa] !border-2 !border-[#f5f2ed] opacity-0 group-hover:opacity-100 transition-opacity !z-20"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-[#c0b8aa] !border-2 !border-[#f5f2ed] opacity-0 group-hover:opacity-100 transition-opacity !z-20"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-[#c0b8aa] !border-2 !border-[#f5f2ed] opacity-0 group-hover:opacity-100 transition-opacity !z-20"
      />

      {/* Card content */}
      <div className={cn(
        "bg-[#f5f2ed] border overflow-hidden shadow-sm transition-all",
        isHighlighted
          ? "border-amber-400 ring-2 ring-amber-400/30 scale-105"
          : "border-[#d0c8ba] hover:border-[#c0b8aa] hover:shadow-md"
      )}>
        {/* Thumbnail or type-specific preview */}
        {card.thumbnail_url ? (
          <div className="bg-[#ddd4c6] relative overflow-hidden">
            <img
              src={card.thumbnail_url}
              alt={card.title}
              className="block max-w-[400px]"
              draggable={false}
            />
            {/* Source badge for links with images */}
            {isLink && (
              <div
                className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 shadow-sm backdrop-blur-sm"
                style={{ backgroundColor: `${sourceInfo.bg}ee`, color: sourceInfo.color }}
              >
                <span>{sourceInfo.icon}</span>
                <span className="capitalize">{card.source === 'web' ? domain.split('.')[0] : card.source}</span>
              </div>
            )}
            {card.source_url && (
              <a
                href={card.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 p-1.5 bg-[#f5f2ed]/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#f5f2ed] shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#6b635a]" />
              </a>
            )}
          </div>
        ) : isText ? (
          /* Text note card - show content preview */
          <div className="w-[200px] h-[150px] bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4 relative">
            <div className="absolute top-2 left-2">
              <Type className="w-4 h-4 text-amber-600/60" />
            </div>
            <p className="text-[#6b635a] text-sm text-center line-clamp-4 leading-relaxed italic">
              {card.notes || 'Empty note'}
            </p>
          </div>
        ) : isLink ? (
          /* Link without image - show link preview placeholder */
          <div className="w-[200px] h-[150px] relative overflow-hidden" style={{ backgroundColor: sourceInfo.bg }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${sourceInfo.color}15` }}
              >
                {sourceInfo.icon}
              </div>
              <span className="text-xs font-medium capitalize px-2 text-center" style={{ color: sourceInfo.color }}>
                {card.source === 'web' ? domain : card.source}
              </span>
            </div>
            {card.source_url && (
              <a
                href={card.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#6b635a]" />
              </a>
            )}
          </div>
        ) : (
          /* Fallback for other types without image */
          <div className="w-[200px] h-[150px] bg-[#ddd4c6] flex items-center justify-center">
            <span className="text-[#8a8278] text-sm">No preview</span>
          </div>
        )}

        {/* Title and metadata */}
        <div className="p-3">
          <h3 className="text-[#1a1816] text-sm font-medium truncate max-w-[200px]">
            {card.title}
          </h3>
          {/* Show domain for links without notes */}
          {isLink && domain && !card.notes && (
            <p className="text-[#a09890] text-xs mt-1 truncate flex items-center gap-1">
              <Link2 className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{domain}</span>
            </p>
          )}
          {card.notes && (
            <p className="text-[#6b635a] text-xs mt-1 line-clamp-2">
              {card.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  )
})
