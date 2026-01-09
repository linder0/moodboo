'use client'

import { useEffect } from 'react'
import { CanvasTool } from '@/components/canvas/canvas-toolbar'

interface UseCanvasShortcutsOptions {
  activeTool: CanvasTool
  setActiveTool: (tool: CanvasTool) => void
  setShowAddPanel: (show: boolean) => void
}

/**
 * Hook to handle keyboard shortcuts for canvas tools.
 */
export function useCanvasShortcuts({
  activeTool,
  setActiveTool,
  setShowAddPanel,
}: UseCanvasShortcutsOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select')
          break
        case 'f':
          setActiveTool('frame')
          break
        case 't':
          setActiveTool('text')
          break
        case 'c':
          setActiveTool('connector')
          break
        case 'a':
          setActiveTool('add')
          setShowAddPanel(true)
          break
        case 'escape':
          setActiveTool('select')
          setShowAddPanel(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeTool, setActiveTool, setShowAddPanel])
}
