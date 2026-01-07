// Reference Card types
export type CardType = 'image' | 'file' | 'link' | 'text'

export type CardSource =
  | 'upload'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'twitter'
  | 'pinterest'
  | 'arena'
  | 'googledoc'
  | 'notion'
  | 'web'

export type CardRole =
  | 'lighting'
  | 'styling'
  | 'pose'
  | 'composition'
  | 'set'
  | 'color'
  | 'general'

// AI Vision Analysis types
export type LightingType = 'natural' | 'studio' | 'mixed' | 'ambient'
export type LightingDirection = 'front' | 'side' | 'back' | 'diffused' | 'top' | 'bottom'
export type LightingQuality = 'hard' | 'soft' | 'dramatic' | 'flat'
export type CompositionStyle = 'centered' | 'rule-of-thirds' | 'symmetrical' | 'asymmetrical' | 'diagonal'
export type FramingType = 'tight' | 'medium' | 'wide' | 'extreme-close' | 'full-body'
export type PerspectiveType = 'eye-level' | 'high-angle' | 'low-angle' | 'birds-eye' | 'worms-eye'

export interface CardAnalysis {
  palette: string[]  // Hex codes: ["#1a1a2e", "#e94560", ...]
  lighting: {
    type: LightingType
    direction: LightingDirection
    quality: LightingQuality
    description: string  // "Soft window light from camera-left"
  }
  composition: {
    style: CompositionStyle
    framing: FramingType
    perspective: PerspectiveType
  }
  mood: string[]     // ["intimate", "warm", "nostalgic"]
  tags: string[]     // ["portrait", "indoor", "fashion", "minimal"]
  summary: string    // One-sentence visual description
}

export interface ReferenceCard {
  id: string
  board_id: string
  type: CardType
  source: CardSource
  title: string
  thumbnail_url: string | null
  source_url: string | null
  file_path: string | null
  notes: string | null
  tags: string[]
  role: CardRole | null
  pinned: boolean
  position: number
  // Canvas position
  x: number
  y: number
  width: number
  height: number
  // AI analysis
  analysis: CardAnalysis | null
  created_at: string
}

// Connection between two cards
export interface Connection {
  id: string
  board_id: string
  source_card_id: string
  target_card_id: string
  label: string | null
  created_at: string
}

// Text label on canvas (for future use)
export interface CanvasLabel {
  id: string
  board_id: string
  text: string
  x: number
  y: number
  font_size: number
  color: string
  created_at: string
}

export interface Board {
  id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

// Board-level aesthetic summary (aggregated from card analyses)
export interface BoardAesthetic {
  dominantPalette: string[]    // Top 6 colors across all cards
  lightingProfile: string      // "Predominantly soft natural light"
  moodKeywords: string[]       // Merged + deduplicated from all cards
  styleSignature: string       // AI-generated one-liner about the board's vibe
  cardCount: number
  analyzedCount: number
}

// Chat/Command Palette response types
export interface ChatAction {
  highlightCardIds?: string[]   // Cards to visually highlight
  suggestedTags?: string[]      // Tags to add
  generatedContent?: string     // For copy/synthesis requests
}

export interface ChatResponse {
  message: string               // Natural language response
  actions?: ChatAction
}
