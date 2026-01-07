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
