import { CardSource } from './types'

/**
 * Shared design tokens for the moodboard app.
 * Centralizes colors, styles, and visual constants to maintain DRY principles.
 */

// =============================================================================
// Group Colors
// =============================================================================

export type GroupColor =
  | 'neutral'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'

export interface GroupColorConfig {
  bg: string
  border: string
  text: string
  header: string
}

export const GROUP_COLORS: Record<GroupColor, GroupColorConfig> = {
  neutral: { bg: '#f5f2ed', border: '#d0c8ba', text: '#1a1816', header: '#e8e0d4' },
  red: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', header: '#fee2e2' },
  orange: { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c', header: '#ffedd5' },
  amber: { bg: '#fffbeb', border: '#fde68a', text: '#d97706', header: '#fef3c7' },
  yellow: { bg: '#fefce8', border: '#fef08a', text: '#ca8a04', header: '#fef9c3' },
  lime: { bg: '#f7fee7', border: '#d9f99d', text: '#65a30d', header: '#ecfccb' },
  green: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', header: '#dcfce7' },
  emerald: { bg: '#ecfdf5', border: '#a7f3d0', text: '#059669', header: '#d1fae5' },
  teal: { bg: '#f0fdfa', border: '#99f6e4', text: '#0d9488', header: '#ccfbf1' },
  cyan: { bg: '#ecfeff', border: '#a5f3fc', text: '#0891b2', header: '#cffafe' },
  sky: { bg: '#f0f9ff', border: '#bae6fd', text: '#0284c7', header: '#e0f2fe' },
  blue: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', header: '#dbeafe' },
  indigo: { bg: '#eef2ff', border: '#c7d2fe', text: '#4f46e5', header: '#e0e7ff' },
  violet: { bg: '#f5f3ff', border: '#ddd6fe', text: '#7c3aed', header: '#ede9fe' },
  purple: { bg: '#faf5ff', border: '#e9d5ff', text: '#9333ea', header: '#f3e8ff' },
  fuchsia: { bg: '#fdf4ff', border: '#f5d0fe', text: '#c026d3', header: '#fae8ff' },
  pink: { bg: '#fdf2f8', border: '#fbcfe8', text: '#db2777', header: '#fce7f3' },
  rose: { bg: '#fff1f2', border: '#fecdd3', text: '#e11d48', header: '#ffe4e6' },
}

export const GROUP_COLOR_OPTIONS: GroupColor[] = [
  'neutral', 'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'emerald', 'teal', 'cyan', 'sky', 'blue',
  'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
]

// =============================================================================
// Card Source Styling
// =============================================================================

export interface SourceConfig {
  icon: string
  color: string
  bg: string
}

export const SOURCE_STYLES: Record<CardSource, SourceConfig> = {
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

// Platforms that support embedding
export const EMBEDDABLE_SOURCES: CardSource[] = ['tiktok', 'youtube', 'twitter']

// =============================================================================
// Canvas Theme Colors
// =============================================================================

export const CANVAS_COLORS = {
  // Background
  canvasBg: '#e8e0d4',

  // Card colors
  cardBg: '#f5f2ed',
  cardBorder: '#d0c8ba',
  cardBorderHover: '#c0b8aa',
  cardPlaceholder: '#ddd4c6',

  // Text colors
  textPrimary: '#1a1816',
  textSecondary: '#6b635a',
  textMuted: '#a09890',
  textDisabled: '#c5bdb0',

  // Interactive
  handleColor: '#c0b8aa',

  // Edge/connection styling
  edgeStroke: '#d0c8bc',
} as const

export const EDGE_STYLE = {
  stroke: CANVAS_COLORS.edgeStroke,
  strokeWidth: 2,
} as const
