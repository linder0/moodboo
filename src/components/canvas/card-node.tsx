'use client'

import { memo, useState, useEffect, useMemo } from 'react'
import { Handle, Position, NodeProps, useUpdateNodeInternals } from '@xyflow/react'
import { ReferenceCard } from '@/lib/types'
import { ExternalLink, Link2, Type, MoreVertical, Trash2 } from 'lucide-react'
import {
  cn,
  getCardDimensions,
  getDomainFromUrl,
  calculateCardDimensionsFromImage,
  CARD_CONSTANTS
} from '@/lib/utils'
import { SOURCE_STYLES, EMBEDDABLE_SOURCES } from '@/lib/design-tokens'
import { EmbedPreview } from './embed-preview'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CardNodeData {
  card: ReferenceCard
  isHighlighted?: boolean
  onResize?: (cardId: string, width: number, height: number) => void
  onDelete?: (cardId: string) => void
}

// Shared handle styles for connection points
const HANDLE_CLASS = "!w-3 !h-3 !bg-[#c0b8aa] !border-2 !border-[#f5f2ed] opacity-0 group-hover:opacity-100 transition-opacity !z-20"


// External link button shown on hover
function ExternalLinkButton({ url, variant = 'light' }: { url: string; variant?: 'light' | 'dark' }) {
  const bgClass = variant === 'dark'
    ? "bg-white/90 hover:bg-white"
    : "bg-[#f5f2ed]/90 hover:bg-[#f5f2ed]"
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 ${bgClass}`}
      onClick={(e) => e.stopPropagation()}
    >
      <ExternalLink className="w-3.5 h-3.5 text-[#6b635a]" />
    </a>
  )
}

export const CardNode = memo(function CardNode({ data }: NodeProps) {
  const { card, isHighlighted, onDelete, onResize } = data as unknown as CardNodeData
  const isLink = card.type === 'link'
  const isText = card.type === 'text'
  const isImage = card.type === 'image' || (card.thumbnail_url && !isLink)
  const sourceInfo = SOURCE_STYLES[card.source] || SOURCE_STYLES.web
  const domain = card.source_url ? getDomainFromUrl(card.source_url) : ''

  // Track image dimensions for proper aspect ratio
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const updateNodeInternals = useUpdateNodeInternals()

  // Preload image to get dimensions ASAP
  useEffect(() => {
    if (card.thumbnail_url) {
      const img = new Image()
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.src = card.thumbnail_url
    }
  }, [card.thumbnail_url])

  // Handle when the rendered img element loads
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img.naturalWidth && img.naturalHeight && !imageDimensions) {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
  }

  // Calculate dimensions - size card to fit the full image
  const { width: cardWidth, height: cardHeight, imageHeight: calculatedImageHeight } = useMemo(() => {
    // For images, always calculate from actual image dimensions when available
    if (card.thumbnail_url && imageDimensions) {
      const aspectRatio = imageDimensions.width / imageDimensions.height
      const imageWidth = CARD_CONSTANTS.WIDTH
      const imageHeight = imageWidth / aspectRatio
      const totalHeight = imageHeight + CARD_CONSTANTS.TITLE_HEIGHT
      return {
        width: imageWidth,
        height: totalHeight,
        imageHeight: imageHeight
      }
    }
    // Use saved dimensions if available
    if (card.width && card.width > 0 && card.height && card.height > 0) {
      return {
        width: card.width,
        height: card.height,
        imageHeight: card.height - CARD_CONSTANTS.TITLE_HEIGHT
      }
    }
    // Fallback to type-based defaults
    const dims = getCardDimensions(card.type, card.source, !!card.thumbnail_url)
    return {
      ...dims,
      imageHeight: dims.height - CARD_CONSTANTS.TITLE_HEIGHT
    }
  }, [card.width, card.height, card.thumbnail_url, card.type, card.source, imageDimensions])

  const contentHeight = calculatedImageHeight

  // Update React Flow when dimensions change, and save to DB if this is initial sizing
  useEffect(() => {
    updateNodeInternals(card.id)

    // If card doesn't have saved dimensions but we calculated them, save them
    if (imageDimensions && (!card.width || card.width === 0) && onResize) {
      onResize(card.id, cardWidth, cardHeight)
    }
  }, [cardWidth, cardHeight, card.id, card.width, imageDimensions, onResize, updateNodeInternals])

  return (
    <div
      className="group transition-all duration-200 ease-out"
      style={{ width: cardWidth, height: cardHeight }}
    >
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
      <Handle type="target" position={Position.Left} id="left" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} id="right" className={HANDLE_CLASS} />

      {/* Card content - explicit pixel dimensions */}
      <div
        className={cn(
          "bg-[#f5f2ed] border overflow-hidden shadow-sm transition-all duration-200 ease-out z-10",
          isHighlighted
            ? "border-amber-400 ring-2 ring-amber-400/30 scale-105"
            : "border-[#d0c8ba] hover:border-[#c0b8aa] hover:shadow-md"
        )}
        style={{ width: cardWidth, height: cardHeight }}
      >
        {/* Thumbnail or type-specific preview - sized to fit image */}
        {card.thumbnail_url ? (
          <div
            className="bg-[#f8f6f3] relative overflow-hidden group/thumb flex items-center justify-center"
            style={{ height: contentHeight }}
          >
            {/* Clickable image - opens lightbox for images, external link for links */}
            {isLink && card.source_url ? (
              <a
                href={card.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full relative cursor-pointer nodrag"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={card.thumbnail_url}
                  alt={card.title}
                  className="w-full h-full object-contain"
                  draggable={false}
                  onLoad={handleImageLoad}
                />
              </a>
            ) : (
              <img
                src={card.thumbnail_url}
                alt={card.title}
                className="w-full h-full object-contain"
                draggable={false}
                onLoad={handleImageLoad}
              />
            )}
            {/* Source badge for links with images */}
            {isLink && (
              <div
                className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 shadow-sm backdrop-blur-sm pointer-events-none"
                style={{ backgroundColor: `${sourceInfo.bg}ee`, color: sourceInfo.color }}
              >
                <span>{sourceInfo.icon}</span>
                <span className="capitalize">{card.source === 'web' ? domain.split('.')[0] : card.source}</span>
              </div>
            )}
          </div>
        ) : isText ? (
          /* Text note card - show content preview */
          <div
            className="bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4 relative"
            style={{ height: contentHeight }}
          >
            <div className="absolute top-2 left-2">
              <Type className="w-4 h-4 text-amber-600/60" />
            </div>
            <p className="text-[#6b635a] text-sm text-center line-clamp-4 leading-relaxed italic">
              {card.notes || 'Empty note'}
            </p>
          </div>
        ) : isLink && card.source_url && EMBEDDABLE_SOURCES.includes(card.source) ? (
          /* Embeddable link - show iframe embed */
          <div
            className="relative overflow-hidden bg-black"
            style={{ height: contentHeight }}
          >
            <EmbedPreview
              url={card.source_url}
              source={card.source}
              className="w-full h-full"
            />
            <ExternalLinkButton url={card.source_url} variant="dark" />
          </div>
        ) : isLink ? (
          /* Link without image - show link preview placeholder */
          <div
            className="relative overflow-hidden"
            style={{ height: contentHeight, backgroundColor: sourceInfo.bg }}
          >
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
            {card.source_url && <ExternalLinkButton url={card.source_url} variant="dark" />}
          </div>
        ) : (
          /* Fallback for other types without image */
          <div
            className="bg-[#ddd4c6] flex items-center justify-center"
            style={{ height: contentHeight }}
          >
            <span className="text-[#8a8278] text-sm">No preview</span>
          </div>
        )}

        {/* Title and metadata */}
        <div
          className="p-3 relative overflow-hidden"
          style={{ height: CARD_CONSTANTS.TITLE_HEIGHT }}
        >
          <div className="flex items-start gap-2">
            <h3
              className="text-[#1a1816] text-sm font-medium truncate flex-1"
              title={card.title}
            >
              {card.title}
            </h3>
            {/* 3-dot menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#ddd4c6] transition-all nodrag"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4 text-[#6b635a]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px] bg-[#f5f2ed] border-[#d0c8ba]">
                {card.source_url && (
                  <DropdownMenuItem asChild>
                    <a
                      href={card.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#1a1816] cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open link
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete?.(card.id)}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
