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
  embed_html: z.string().nullable().optional(),
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
  // Group membership
  group_id: z.string().uuid().nullable().optional(),
})

// Group color schema
export const groupColorSchema = z.enum([
  'neutral',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
])

// Group schemas
export const createGroupSchema = z.object({
  board_id: z.string().uuid(),
  title: z.string().optional().default('Untitled Group'),
  color: groupColorSchema.optional().default('neutral'),
  notes: z.string().nullable().optional(),
  x: z.number().optional().default(0),
  y: z.number().optional().default(0),
  width: z.number().optional().default(400),
  height: z.number().optional().default(300),
  card_ids: z.array(z.string().uuid()).optional().default([]),
})

export const updateGroupSchema = z.object({
  title: z.string().optional(),
  color: groupColorSchema.optional(),
  collapsed: z.boolean().optional(),
  locked: z.boolean().optional(),
  notes: z.string().nullable().optional(),
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

// Card Analysis schema (from AI vision analysis)
export const cardAnalysisSchema = z.object({
  palette: z.array(z.string()),
  lighting: z.object({
    type: z.enum(['natural', 'studio', 'mixed', 'ambient']),
    direction: z.enum(['front', 'side', 'back', 'diffused', 'top', 'bottom']),
    quality: z.enum(['hard', 'soft', 'dramatic', 'flat']),
    description: z.string(),
  }),
  composition: z.object({
    style: z.enum(['centered', 'rule-of-thirds', 'symmetrical', 'asymmetrical', 'diagonal']),
    framing: z.enum(['tight', 'medium', 'wide', 'extreme-close', 'full-body']),
    perspective: z.enum(['eye-level', 'high-angle', 'low-angle', 'birds-eye', 'worms-eye']),
  }),
  mood: z.array(z.string()),
  tags: z.array(z.string()),
  summary: z.string(),
})

// Chat response schema
export const chatResponseSchema = z.object({
  message: z.string(),
  actions: z.object({
    highlightCardIds: z.array(z.string()).optional(),
    suggestedTags: z.array(z.string()).optional(),
    generatedContent: z.string().optional(),
  }),
})

// JSON schema for OpenAI structured output - Card Analysis
export const CARD_ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    palette: {
      type: "array",
      items: { type: "string" },
      description: "5-6 hex color codes representing the dominant colors"
    },
    lighting: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: { type: "string", enum: ["natural", "studio", "mixed", "ambient"] },
        direction: { type: "string", enum: ["front", "side", "back", "diffused", "top", "bottom"] },
        quality: { type: "string", enum: ["hard", "soft", "dramatic", "flat"] },
        description: { type: "string" }
      },
      required: ["type", "direction", "quality", "description"]
    },
    composition: {
      type: "object",
      additionalProperties: false,
      properties: {
        style: { type: "string", enum: ["centered", "rule-of-thirds", "symmetrical", "asymmetrical", "diagonal"] },
        framing: { type: "string", enum: ["tight", "medium", "wide", "extreme-close", "full-body"] },
        perspective: { type: "string", enum: ["eye-level", "high-angle", "low-angle", "birds-eye", "worms-eye"] }
      },
      required: ["style", "framing", "perspective"]
    },
    mood: {
      type: "array",
      items: { type: "string" },
      description: "3-5 mood/atmosphere keywords"
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "5-10 descriptive tags for the image content"
    },
    summary: {
      type: "string",
      description: "One-sentence visual description"
    }
  },
  required: ["palette", "lighting", "composition", "mood", "tags", "summary"]
}

// JSON schema for OpenAI structured output - Chat Response
// Note: For strict mode, all nested objects need explicit required arrays
export const CHAT_RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    message: { type: "string" },
    actions: {
      type: "object",
      additionalProperties: false,
      properties: {
        highlightCardIds: { type: "array", items: { type: "string" } },
        suggestedTags: { type: "array", items: { type: "string" } },
        generatedContent: { type: "string" }
      },
      required: []
    }
  },
  required: ["message", "actions"]
}
