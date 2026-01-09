'use client'

import { useCallback, useRef } from 'react'

/**
 * Hook for debounced saves to the API.
 * Groups updates by a key to avoid overwriting concurrent saves.
 */
export function useDebouncedSave(delayMs: number = 500) {
  const timeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const debouncedSave = useCallback(
    async (
      key: string,
      saveFn: () => Promise<void>
    ) => {
      const existing = timeouts.current.get(key)
      if (existing) clearTimeout(existing)

      const timeout = setTimeout(async () => {
        try {
          await saveFn()
        } catch (error) {
          console.error(`Failed to save (${key}):`, error)
        }
        timeouts.current.delete(key)
      }, delayMs)

      timeouts.current.set(key, timeout)
    },
    [delayMs]
  )

  // Clean up on unmount
  const cleanup = useCallback(() => {
    for (const timeout of timeouts.current.values()) {
      clearTimeout(timeout)
    }
    timeouts.current.clear()
  }, [])

  return { debouncedSave, cleanup }
}

/**
 * Hook specifically for debounced card updates.
 */
export function useDebouncedCardUpdate() {
  const { debouncedSave } = useDebouncedSave()

  const updateCard = useCallback(
    (cardId: string, updates: Record<string, unknown>, debounceKey: string) => {
      const key = `${cardId}-${debounceKey}`

      debouncedSave(key, async () => {
        await fetch(`/api/cards/${cardId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
      })
    },
    [debouncedSave]
  )

  return { updateCard }
}
