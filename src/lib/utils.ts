import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistanceToNow(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears}y ago`
}

export function detectSourceFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    if (hostname.includes('instagram.com')) return 'instagram'
    if (hostname.includes('tiktok.com')) return 'tiktok'
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube'
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter'
    if (hostname.includes('pinterest.com')) return 'pinterest'
    if (hostname.includes('are.na')) return 'arena'
    if (hostname.includes('docs.google.com')) return 'googledoc'
    if (hostname.includes('notion.so') || hostname.includes('notion.site')) return 'notion'

    return 'web'
  } catch {
    return 'web'
  }
}

// Card canvas positioning and dimension constants
export const CARD_CONSTANTS = {
  // Default card width used for all cards
  WIDTH: 280,
  // Fixed height for title/metadata section
  TITLE_HEIGHT: 56,
  // Height constraints (generous max to avoid cropping)
  MIN_HEIGHT: 100,
  MAX_HEIGHT: 800,
  // Grid layout for initial positioning
  GRID: { cols: 4, spacingX: 300, spacingY: 350, offsetX: 100, offsetY: 100 },
}

// Legacy exports for backwards compatibility
export const CARD_DEFAULTS = { width: CARD_CONSTANTS.WIDTH, height: 280 }
export const CARD_GRID = CARD_CONSTANTS.GRID

// Dimensions by card type/source
export const CARD_DIMENSIONS: Record<string, { width: number; height: number }> = {
  // Embeds (cards without thumbnails)
  tiktok: { width: 280, height: 500 },
  youtube: { width: 400, height: 260 },
  twitter: { width: 320, height: 200 },
  // Cards with thumbnails
  image: { width: 280, height: 320 },
  // Other types
  text: { width: 280, height: 200 },
  default: { width: 280, height: 280 },
}

// Extract domain from URL for display
export function getDomainFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

// Calculate card dimensions from image aspect ratio
export function calculateCardDimensionsFromImage(
  imageWidth: number,
  imageHeight: number
): { width: number; height: number } {
  const aspectRatio = imageWidth / imageHeight
  const cardWidth = CARD_CONSTANTS.WIDTH
  const imageAreaHeight = cardWidth / aspectRatio
  const totalHeight = Math.min(
    Math.max(imageAreaHeight + CARD_CONSTANTS.TITLE_HEIGHT, CARD_CONSTANTS.MIN_HEIGHT),
    CARD_CONSTANTS.MAX_HEIGHT
  )
  return { width: cardWidth, height: totalHeight }
}

export function getCardDimensions(
  type: string,
  source: string,
  hasThumbnail: boolean = false
): { width: number; height: number } {
  // If card has a thumbnail, use standard image dimensions
  // (embed dimensions are only for actual embeds without thumbnails)
  if (hasThumbnail) {
    return CARD_DIMENSIONS.image
  }
  // Check source for embeds
  if (CARD_DIMENSIONS[source]) {
    return CARD_DIMENSIONS[source]
  }
  // Then check type
  if (CARD_DIMENSIONS[type]) {
    return CARD_DIMENSIONS[type]
  }
  return CARD_DIMENSIONS.default
}

export function getDefaultCardPosition(index: number) {
  return {
    x: CARD_GRID.offsetX + (index % CARD_GRID.cols) * CARD_GRID.spacingX,
    y: CARD_GRID.offsetY + Math.floor(index / CARD_GRID.cols) * CARD_GRID.spacingY,
    ...CARD_DEFAULTS,
  }
}

export function ensureCardPosition(
  card: Partial<{ x: number; y: number; width: number; height: number }>,
  index: number
): { x: number; y: number; width: number; height: number } {
  const defaults = getDefaultCardPosition(index)
  // Treat 0 as unset since DB defaults to 0 and (0,0) is not a valid card position
  const cardX = card.x
  const cardY = card.y
  const hasValidPosition = typeof cardX === 'number' && cardX !== 0

  return {
    x: hasValidPosition ? cardX : defaults.x,
    y: hasValidPosition && typeof cardY === 'number' ? cardY : defaults.y,
    width: typeof card.width === 'number' && card.width > 0 ? card.width : defaults.width,
    height: typeof card.height === 'number' && card.height > 0 ? card.height : defaults.height,
  }
}
