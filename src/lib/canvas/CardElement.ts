import { CanvasElement, CanvasElementConfig } from './CanvasElement'
import { ReferenceCard, CardType, CardSource, CardRole, CardAnalysis } from '@/lib/types'
import { calculateCardDimensionsFromImage, getCardDimensions, CARD_CONSTANTS } from '@/lib/utils'

/**
 * Represents a card on the canvas.
 * Wraps ReferenceCard data with canvas-specific functionality.
 */
export class CardElement extends CanvasElement {
  readonly boardId: string
  readonly cardType: CardType
  readonly source: CardSource

  private _title: string
  private _thumbnailUrl: string | null
  private _sourceUrl: string | null
  private _filePath: string | null
  private _tags: string[]
  private _role: CardRole | null
  private _pinned: boolean
  private _position: number
  private _embedHtml: string | null
  private _analysis: CardAnalysis | null
  private _groupId: string | null

  constructor(config: CardElementConfig) {
    super({
      id: config.id,
      type: 'card',
      x: config.x,
      y: config.y,
      width: config.width,
      height: config.height,
      notes: config.notes,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    })

    this.boardId = config.boardId
    this.cardType = config.cardType
    this.source = config.source
    this._title = config.title
    this._thumbnailUrl = config.thumbnailUrl ?? null
    this._sourceUrl = config.sourceUrl ?? null
    this._filePath = config.filePath ?? null
    this._tags = config.tags ?? []
    this._role = config.role ?? null
    this._pinned = config.pinned ?? false
    this._position = config.position ?? 0
    this._embedHtml = config.embedHtml ?? null
    this._analysis = config.analysis ?? null
    this._groupId = config.groupId ?? null
  }

  // Card-specific getters
  get title(): string { return this._title }
  get thumbnailUrl(): string | null { return this._thumbnailUrl }
  get sourceUrl(): string | null { return this._sourceUrl }
  get filePath(): string | null { return this._filePath }
  get tags(): string[] { return [...this._tags] }
  get role(): CardRole | null { return this._role }
  get pinned(): boolean { return this._pinned }
  get position(): number { return this._position }
  get embedHtml(): string | null { return this._embedHtml }
  get analysis(): CardAnalysis | null { return this._analysis }
  get groupId(): string | null { return this._groupId }

  // Minimum dimensions for cards
  get minWidth(): number { return 120 }
  get minHeight(): number { return CARD_CONSTANTS.MIN_HEIGHT }

  // Card-specific setters
  setTitle(title: string): this {
    this._title = title
    this._updatedAt = new Date()
    return this
  }

  setTags(tags: string[]): this {
    this._tags = [...tags]
    this._updatedAt = new Date()
    return this
  }

  addTag(tag: string): this {
    if (!this._tags.includes(tag)) {
      this._tags.push(tag)
      this._updatedAt = new Date()
    }
    return this
  }

  removeTag(tag: string): this {
    const index = this._tags.indexOf(tag)
    if (index !== -1) {
      this._tags.splice(index, 1)
      this._updatedAt = new Date()
    }
    return this
  }

  setRole(role: CardRole | null): this {
    this._role = role
    this._updatedAt = new Date()
    return this
  }

  setPinned(pinned: boolean): this {
    this._pinned = pinned
    this._updatedAt = new Date()
    return this
  }

  setPosition(position: number): this {
    this._position = position
    this._updatedAt = new Date()
    return this
  }

  setAnalysis(analysis: CardAnalysis | null): this {
    this._analysis = analysis
    this._updatedAt = new Date()
    return this
  }

  setGroupId(groupId: string | null): this {
    this._groupId = groupId
    this._updatedAt = new Date()
    return this
  }

  // Calculate optimal dimensions based on image
  calculateDimensionsFromImage(imageWidth: number, imageHeight: number): { width: number; height: number } {
    return calculateCardDimensionsFromImage(imageWidth, imageHeight)
  }

  // Get default dimensions based on type/source
  getDefaultDimensions(): { width: number; height: number } {
    return getCardDimensions(this.cardType, this.source, !!this._thumbnailUrl)
  }

  // Convert to ReferenceCard format (for React Flow node data)
  toReferenceCard(): ReferenceCard {
    return {
      id: this.id,
      board_id: this.boardId,
      type: this.cardType,
      source: this.source,
      title: this._title,
      thumbnail_url: this._thumbnailUrl,
      source_url: this._sourceUrl,
      file_path: this._filePath,
      notes: this._notes,
      tags: this._tags,
      role: this._role,
      pinned: this._pinned,
      position: this._position,
      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height,
      embed_html: this._embedHtml,
      analysis: this._analysis,
      group_id: this._groupId,
      created_at: this._createdAt.toISOString(),
    }
  }

  // Serialization
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      type: this.type,
      boardId: this.boardId,
      cardType: this.cardType,
      source: this.source,
      title: this._title,
      thumbnailUrl: this._thumbnailUrl,
      sourceUrl: this._sourceUrl,
      filePath: this._filePath,
      notes: this._notes,
      tags: this._tags,
      role: this._role,
      pinned: this._pinned,
      position: this._position,
      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height,
      embedHtml: this._embedHtml,
      analysis: this._analysis,
      groupId: this._groupId,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    }
  }

  clone(): CardElement {
    return new CardElement({
      id: crypto.randomUUID(),
      boardId: this.boardId,
      cardType: this.cardType,
      source: this.source,
      title: this._title,
      thumbnailUrl: this._thumbnailUrl,
      sourceUrl: this._sourceUrl,
      filePath: this._filePath,
      notes: this._notes,
      tags: [...this._tags],
      role: this._role,
      pinned: false,
      position: this._position,
      x: this._x + 20,
      y: this._y + 20,
      width: this._width,
      height: this._height,
      embedHtml: this._embedHtml,
      analysis: this._analysis,
      groupId: this._groupId,
    })
  }

  // Factory method to create from ReferenceCard
  static fromReferenceCard(card: ReferenceCard): CardElement {
    return new CardElement({
      id: card.id,
      boardId: card.board_id,
      cardType: card.type,
      source: card.source,
      title: card.title,
      thumbnailUrl: card.thumbnail_url,
      sourceUrl: card.source_url,
      filePath: card.file_path,
      notes: card.notes,
      tags: card.tags,
      role: card.role,
      pinned: card.pinned,
      position: card.position,
      x: card.x,
      y: card.y,
      width: card.width,
      height: card.height,
      embedHtml: card.embed_html,
      analysis: card.analysis,
      createdAt: new Date(card.created_at),
    })
  }
}

// Types
export interface CardElementConfig extends Partial<CanvasElementConfig> {
  id: string
  boardId: string
  cardType: CardType
  source: CardSource
  title: string
  thumbnailUrl?: string | null
  sourceUrl?: string | null
  filePath?: string | null
  notes?: string | null
  tags?: string[]
  role?: CardRole | null
  pinned?: boolean
  position?: number
  embedHtml?: string | null
  analysis?: CardAnalysis | null
  groupId?: string | null
}
