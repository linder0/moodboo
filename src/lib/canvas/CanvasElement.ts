/**
 * Base class for all canvas elements (cards, groups, labels, etc.)
 * Provides common functionality for positioning, selection, and serialization.
 */
export abstract class CanvasElement {
  readonly id: string
  readonly type: CanvasElementType

  protected _x: number
  protected _y: number
  protected _width: number
  protected _height: number
  protected _isSelected: boolean = false
  protected _notes: string | null = null
  protected _createdAt: Date
  protected _updatedAt: Date

  constructor(config: CanvasElementConfig) {
    this.id = config.id
    this.type = config.type
    this._x = config.x ?? 0
    this._y = config.y ?? 0
    this._width = config.width ?? 280
    this._height = config.height ?? 280
    this._notes = config.notes ?? null
    this._createdAt = config.createdAt ?? new Date()
    this._updatedAt = config.updatedAt ?? new Date()
  }

  // Position getters/setters
  get x(): number { return this._x }
  get y(): number { return this._y }
  get width(): number { return this._width }
  get height(): number { return this._height }
  get notes(): string | null { return this._notes }
  get isSelected(): boolean { return this._isSelected }
  get createdAt(): Date { return this._createdAt }
  get updatedAt(): Date { return this._updatedAt }

  // Computed bounds
  get bounds(): ElementBounds {
    return {
      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height,
      right: this._x + this._width,
      bottom: this._y + this._height,
      centerX: this._x + this._width / 2,
      centerY: this._y + this._height / 2,
    }
  }

  // Movement
  moveTo(x: number, y: number): this {
    this._x = x
    this._y = y
    this._updatedAt = new Date()
    return this
  }

  moveBy(deltaX: number, deltaY: number): this {
    this._x += deltaX
    this._y += deltaY
    this._updatedAt = new Date()
    return this
  }

  // Resizing
  resize(width: number, height: number): this {
    this._width = Math.max(width, this.minWidth)
    this._height = Math.max(height, this.minHeight)
    this._updatedAt = new Date()
    return this
  }

  // Selection
  select(): this {
    this._isSelected = true
    return this
  }

  deselect(): this {
    this._isSelected = false
    return this
  }

  toggleSelection(): this {
    this._isSelected = !this._isSelected
    return this
  }

  // Notes
  setNotes(notes: string | null): this {
    this._notes = notes
    this._updatedAt = new Date()
    return this
  }

  // Collision detection
  containsPoint(x: number, y: number): boolean {
    return (
      x >= this._x &&
      x <= this._x + this._width &&
      y >= this._y &&
      y <= this._y + this._height
    )
  }

  intersects(other: CanvasElement | ElementBounds): boolean {
    const otherBounds = 'bounds' in other ? other.bounds : other
    return !(
      this._x + this._width < otherBounds.x ||
      this._x > otherBounds.x + otherBounds.width ||
      this._y + this._height < otherBounds.y ||
      this._y > otherBounds.y + otherBounds.height
    )
  }

  // Abstract methods - must be implemented by subclasses
  abstract get minWidth(): number
  abstract get minHeight(): number
  abstract toJSON(): Record<string, unknown>
  abstract clone(): CanvasElement
}

// Types
export type CanvasElementType = 'card' | 'group' | 'label'

export interface CanvasElementConfig {
  id: string
  type: CanvasElementType
  x?: number
  y?: number
  width?: number
  height?: number
  notes?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface ElementBounds {
  x: number
  y: number
  width: number
  height: number
  right: number
  bottom: number
  centerX: number
  centerY: number
}
