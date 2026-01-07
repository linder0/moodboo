import { z } from 'zod'

// Card schemas
export const cardTypeSchema = z.enum(['image', 'file', 'link', 'text'])

export const cardSourceSchema = z.enum([
  'upload',
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'pinterest',
  'arena',
  'googledoc',
  'notion',
  'web',
])

export const cardRoleSchema = z.enum([
  'lighting',
  'styling',
  'pose',
  'composition',
  'set',
  'color',
  'general',
])

// Board schemas
export const createBoardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
})

export const updateBoardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
})

// Card creation schemas
export const createCardSchema = z.object({
  board_id: z.string().uuid(),
  type: cardTypeSchema,
  source: cardSourceSchema,
  title: z.string(),
  thumbnail_url: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  file_path: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
  role: cardRoleSchema.nullable().optional(),
  pinned: z.boolean().optional().default(false),
})

export const updateCardSchema = z.object({
  title: z.string().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  role: cardRoleSchema.nullable().optional(),
  pinned: z.boolean().optional(),
  position: z.number().optional(),
  // Canvas position
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

// Connection schemas
export const createConnectionSchema = z.object({
  board_id: z.string().uuid(),
  from_card_id: z.string().uuid(),
  to_card_id: z.string().uuid(),
  label: z.string().nullable().optional(),
})

export const updateConnectionSchema = z.object({
  label: z.string().nullable().optional(),
})
