'use client'

import { useEffect } from 'react'

/**
 * Prevents browser zoom (ctrl/cmd + wheel) so only the canvas zooms.
 */
export function usePreventBrowserZoom(): void {
  useEffect(() => {
    const preventZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }
    document.addEventListener('wheel', preventZoom, { passive: false })
    return () => document.removeEventListener('wheel', preventZoom)
  }, [])
}
