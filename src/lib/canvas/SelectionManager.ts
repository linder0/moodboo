import { CanvasElement, ElementBounds } from './CanvasElement'
import { CardElement } from './CardElement'
import { GroupElement } from './GroupElement'

/**
 * Manages selection state for canvas elements.
 * Supports single, multi, and box selection.
 */
export class SelectionManager {
  private _selectedIds: Set<string> = new Set()
  private _elements: Map<string, CanvasElement> = new Map()
  private _groups: Map<string, GroupElement> = new Map()

  constructor() {}

  // Access elements
  get selectedIds(): string[] {
    return Array.from(this._selectedIds)
  }

  get selectedCount(): number {
    return this._selectedIds.size
  }

  get hasSelection(): boolean {
    return this._selectedIds.size > 0
  }

  get selectedElements(): CanvasElement[] {
    return this.selectedIds
      .map(id => this._elements.get(id))
      .filter((el): el is CanvasElement => el !== undefined)
  }

  get selectedCards(): CardElement[] {
    return this.selectedElements.filter((el): el is CardElement => el instanceof CardElement)
  }

  get selectedGroups(): GroupElement[] {
    return this.selectedElements.filter((el): el is GroupElement => el instanceof GroupElement)
  }

  // Check if only cards are selected (for grouping)
  get canGroup(): boolean {
    return this.selectedCards.length >= 2 && this.selectedGroups.length === 0
  }

  // Registration
  registerElement(element: CanvasElement): void {
    this._elements.set(element.id, element)
    if (element instanceof GroupElement) {
      this._groups.set(element.id, element)
    }
  }

  unregisterElement(id: string): void {
    this._elements.delete(id)
    this._groups.delete(id)
    this._selectedIds.delete(id)
  }

  registerElements(elements: CanvasElement[]): void {
    for (const element of elements) {
      this.registerElement(element)
    }
  }

  clear(): void {
    this._elements.clear()
    this._groups.clear()
    this._selectedIds.clear()
  }

  // Selection operations
  select(id: string): void {
    if (this._elements.has(id)) {
      this._selectedIds.add(id)
      this._elements.get(id)?.select()
    }
  }

  selectOnly(id: string): void {
    this.deselectAll()
    this.select(id)
  }

  selectMultiple(ids: string[]): void {
    for (const id of ids) {
      this.select(id)
    }
  }

  selectAll(): void {
    for (const id of this._elements.keys()) {
      this.select(id)
    }
  }

  deselect(id: string): void {
    this._selectedIds.delete(id)
    this._elements.get(id)?.deselect()
  }

  deselectAll(): void {
    for (const id of this._selectedIds) {
      this._elements.get(id)?.deselect()
    }
    this._selectedIds.clear()
  }

  toggle(id: string): void {
    if (this._selectedIds.has(id)) {
      this.deselect(id)
    } else {
      this.select(id)
    }
  }

  isSelected(id: string): boolean {
    return this._selectedIds.has(id)
  }

  // Box selection
  selectInBounds(bounds: ElementBounds): string[] {
    const selected: string[] = []
    for (const element of this._elements.values()) {
      if (element.intersects(bounds)) {
        this.select(element.id)
        selected.push(element.id)
      }
    }
    return selected
  }

  // Get element by ID
  getElement(id: string): CanvasElement | undefined {
    return this._elements.get(id)
  }

  getCard(id: string): CardElement | undefined {
    const el = this._elements.get(id)
    return el instanceof CardElement ? el : undefined
  }

  getGroup(id: string): GroupElement | undefined {
    return this._groups.get(id)
  }

  // Grouping operations
  createGroupFromSelection(boardId: string): GroupElement | null {
    if (!this.canGroup) return null

    const cards = this.selectedCards
    const group = GroupElement.createFromCards(boardId, cards)

    // Update cards to reference the group
    for (const card of cards) {
      card.setGroupId(group.id)
    }

    this.registerElement(group)
    return group
  }

  ungroupSelection(): CardElement[] {
    const groups = this.selectedGroups
    const freedCards: CardElement[] = []

    for (const group of groups) {
      for (const childId of group.childIds) {
        const card = this.getCard(childId)
        if (card) {
          card.setGroupId(null)
          freedCards.push(card)
        }
      }
      this.unregisterElement(group.id)
    }

    return freedCards
  }

  // Move selected elements
  moveSelection(deltaX: number, deltaY: number): void {
    // Track which cards are already moved via group
    const movedViaGroup = new Set<string>()

    // First move groups (which also moves their children)
    for (const group of this.selectedGroups) {
      const children = group.childIds
        .map(id => this._elements.get(id))
        .filter((el): el is CanvasElement => el !== undefined)

      group.moveWithChildren(deltaX, deltaY, children)

      for (const childId of group.childIds) {
        movedViaGroup.add(childId)
      }
    }

    // Then move cards that weren't moved via a group
    for (const card of this.selectedCards) {
      if (!movedViaGroup.has(card.id)) {
        card.moveBy(deltaX, deltaY)
      }
    }
  }

  // Get bounds of selection
  getSelectionBounds(): ElementBounds | null {
    if (!this.hasSelection) return null

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const element of this.selectedElements) {
      minX = Math.min(minX, element.x)
      minY = Math.min(minY, element.y)
      maxX = Math.max(maxX, element.x + element.width)
      maxY = Math.max(maxY, element.y + element.height)
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      right: maxX,
      bottom: maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    }
  }

  // Delete selected elements
  deleteSelection(): { deletedIds: string[]; orphanedCardIds: string[] } {
    const deletedIds: string[] = []
    const orphanedCardIds: string[] = []

    // First collect cards that will be orphaned from deleted groups
    for (const group of this.selectedGroups) {
      for (const childId of group.childIds) {
        if (!this._selectedIds.has(childId)) {
          const card = this.getCard(childId)
          if (card) {
            card.setGroupId(null)
            orphanedCardIds.push(childId)
          }
        }
      }
    }

    // Then delete all selected elements
    for (const id of this._selectedIds) {
      this.unregisterElement(id)
      deletedIds.push(id)
    }

    this._selectedIds.clear()

    return { deletedIds, orphanedCardIds }
  }

  // Serialize selected elements
  serializeSelection(): {
    cards: ReturnType<CardElement['toJSON']>[]
    groups: ReturnType<GroupElement['toJSON']>[]
  } {
    return {
      cards: this.selectedCards.map(c => c.toJSON()),
      groups: this.selectedGroups.map(g => g.toJSON()),
    }
  }
}
