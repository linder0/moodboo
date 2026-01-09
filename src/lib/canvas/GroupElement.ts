import { CanvasElement, CanvasElementConfig, ElementBounds } from './CanvasElement'
import { CardElement } from './CardElement'
import { GroupColor, GROUP_COLORS } from '@/lib/design-tokens'

/**
 * Represents a group of cards on the canvas.
 * Groups can contain cards and other groups (nested).
 */
export class GroupElement extends CanvasElement {
  readonly boardId: string

  private _title: string
  private _color: GroupColor
  private _collapsed: boolean
  private _childIds: string[] // Card or group IDs
  private _locked: boolean

  constructor(config: GroupElementConfig) {
    super({
      id: config.id,
      type: 'group',
      x: config.x,
      y: config.y,
      width: config.width ?? 400,
      height: config.height ?? 300,
      notes: config.notes,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    })

    this.boardId = config.boardId
    this._title = config.title ?? 'Untitled Group'
    this._color = config.color ?? 'neutral'
    this._collapsed = config.collapsed ?? false
    this._childIds = config.childIds ?? []
    this._locked = config.locked ?? false
  }

  // Group-specific getters
  get title(): string { return this._title }
  get color(): GroupColor { return this._color }
  get collapsed(): boolean { return this._collapsed }
  get childIds(): string[] { return [...this._childIds] }
  get locked(): boolean { return this._locked }
  get isEmpty(): boolean { return this._childIds.length === 0 }
  get childCount(): number { return this._childIds.length }

  // Minimum dimensions for groups
  get minWidth(): number { return 200 }
  get minHeight(): number { return 150 }

  // Header height for collapsed state
  static readonly HEADER_HEIGHT = 48
  static readonly PADDING = 16

  // Group-specific setters
  setTitle(title: string): this {
    this._title = title
    this._updatedAt = new Date()
    return this
  }

  setColor(color: GroupColor): this {
    this._color = color
    this._updatedAt = new Date()
    return this
  }

  collapse(): this {
    this._collapsed = true
    this._updatedAt = new Date()
    return this
  }

  expand(): this {
    this._collapsed = false
    this._updatedAt = new Date()
    return this
  }

  toggleCollapsed(): this {
    this._collapsed = !this._collapsed
    this._updatedAt = new Date()
    return this
  }

  lock(): this {
    this._locked = true
    this._updatedAt = new Date()
    return this
  }

  unlock(): this {
    this._locked = false
    this._updatedAt = new Date()
    return this
  }

  toggleLocked(): this {
    this._locked = !this._locked
    this._updatedAt = new Date()
    return this
  }

  // Child management
  addChild(childId: string): this {
    if (!this._childIds.includes(childId)) {
      this._childIds.push(childId)
      this._updatedAt = new Date()
    }
    return this
  }

  addChildren(childIds: string[]): this {
    for (const id of childIds) {
      if (!this._childIds.includes(id)) {
        this._childIds.push(id)
      }
    }
    this._updatedAt = new Date()
    return this
  }

  removeChild(childId: string): this {
    const index = this._childIds.indexOf(childId)
    if (index !== -1) {
      this._childIds.splice(index, 1)
      this._updatedAt = new Date()
    }
    return this
  }

  hasChild(childId: string): boolean {
    return this._childIds.includes(childId)
  }

  clearChildren(): this {
    this._childIds = []
    this._updatedAt = new Date()
    return this
  }

  /**
   * Calculate bounds that fit all child elements
   * Returns null if there are no children
   */
  calculateBoundsFromChildren(children: CanvasElement[]): ElementBounds | null {
    if (children.length === 0) return null

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const child of children) {
      minX = Math.min(minX, child.x)
      minY = Math.min(minY, child.y)
      maxX = Math.max(maxX, child.x + child.width)
      maxY = Math.max(maxY, child.y + child.height)
    }

    const padding = GroupElement.PADDING
    const headerHeight = GroupElement.HEADER_HEIGHT

    return {
      x: minX - padding,
      y: minY - padding - headerHeight,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2 + headerHeight,
      right: maxX + padding,
      bottom: maxY + padding,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    }
  }

  /**
   * Fit the group bounds to its children with optional padding
   */
  fitToChildren(children: CanvasElement[]): this {
    const bounds = this.calculateBoundsFromChildren(children)
    if (bounds) {
      this._x = bounds.x
      this._y = bounds.y
      this._width = bounds.width
      this._height = bounds.height
      this._updatedAt = new Date()
    }
    return this
  }

  /**
   * Move all children when the group is moved
   */
  moveWithChildren(deltaX: number, deltaY: number, children: CanvasElement[]): this {
    this.moveBy(deltaX, deltaY)
    for (const child of children) {
      child.moveBy(deltaX, deltaY)
    }
    return this
  }

  // Serialization
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      type: this.type,
      boardId: this.boardId,
      title: this._title,
      color: this._color,
      collapsed: this._collapsed,
      childIds: this._childIds,
      locked: this._locked,
      notes: this._notes,
      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    }
  }

  // Convert to database format
  toDatabaseRecord(): GroupRecord {
    return {
      id: this.id,
      board_id: this.boardId,
      title: this._title,
      color: this._color,
      collapsed: this._collapsed,
      locked: this._locked,
      notes: this._notes,
      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height,
      created_at: this._createdAt.toISOString(),
    }
  }

  clone(): GroupElement {
    return new GroupElement({
      id: crypto.randomUUID(),
      boardId: this.boardId,
      title: `${this._title} (copy)`,
      color: this._color,
      collapsed: false,
      childIds: [], // Don't copy children
      locked: false,
      notes: this._notes,
      x: this._x + 20,
      y: this._y + 20,
      width: this._width,
      height: this._height,
    })
  }

  // Factory method to create from database record
  static fromDatabaseRecord(record: GroupRecord, childIds: string[] = []): GroupElement {
    return new GroupElement({
      id: record.id,
      boardId: record.board_id,
      title: record.title,
      color: record.color as GroupColor,
      collapsed: record.collapsed,
      childIds,
      locked: record.locked,
      notes: record.notes,
      x: record.x,
      y: record.y,
      width: record.width,
      height: record.height,
      createdAt: new Date(record.created_at),
    })
  }

  /**
   * Create a group from selected cards
   */
  static createFromCards(boardId: string, cards: CardElement[]): GroupElement {
    const group = new GroupElement({
      id: crypto.randomUUID(),
      boardId,
      title: 'New Group',
      childIds: cards.map(c => c.id),
    })

    // Fit bounds to cards
    group.fitToChildren(cards)

    return group
  }
}

// Re-export GroupColor and GROUP_COLORS for convenience
export type { GroupColor } from '@/lib/design-tokens'
export { GROUP_COLORS } from '@/lib/design-tokens'

export interface GroupElementConfig extends Partial<CanvasElementConfig> {
  id: string
  boardId: string
  title?: string
  color?: GroupColor
  collapsed?: boolean
  childIds?: string[]
  locked?: boolean
  notes?: string | null
}

export interface GroupRecord {
  id: string
  board_id: string
  title: string
  color: string
  collapsed: boolean
  locked: boolean
  notes: string | null
  x: number
  y: number
  width: number
  height: number
  created_at: string
}
