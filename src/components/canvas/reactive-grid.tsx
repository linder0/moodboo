'use client'

import { useEffect, useRef } from 'react'

export type GridPattern = 'dots' | 'grid' | 'none'

interface ReactiveGridProps {
  pattern?: GridPattern
  spacing?: number
  zoom?: number
  offsetX?: number
  offsetY?: number
}

export function ReactiveGrid({
  pattern = 'dots',
  spacing = 32,
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
}: ReactiveGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (pattern === 'none') return
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      const rect = container.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      const scaledSpacing = spacing * zoom

      // Calculate visible range
      const startCol = Math.floor(-offsetX / scaledSpacing) - 1
      const startRow = Math.floor(-offsetY / scaledSpacing) - 1
      const endCol = Math.ceil((rect.width - offsetX) / scaledSpacing) + 1
      const endRow = Math.ceil((rect.height - offsetY) / scaledSpacing) + 1

      // Color relative to background (#e8e0d4) - warm brown tone
      const r = 180, g = 168, b = 150
      const alpha = 0.4

      if (pattern === 'dots') {
        const dotSize = 1.5 * zoom

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`

        for (let i = startCol; i <= endCol; i++) {
          for (let j = startRow; j <= endRow; j++) {
            const screenX = i * scaledSpacing + offsetX
            const screenY = j * scaledSpacing + offsetY

            if (screenX < -scaledSpacing || screenX > rect.width + scaledSpacing ||
                screenY < -scaledSpacing || screenY > rect.height + scaledSpacing) {
              continue
            }

            ctx.beginPath()
            ctx.arc(screenX, screenY, dotSize, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      } else {
        // Draw grid lines
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`
        ctx.lineWidth = 1
        ctx.lineCap = 'square'

        // Vertical lines
        for (let i = startCol; i <= endCol; i++) {
          const screenX = i * scaledSpacing + offsetX
          if (screenX < -scaledSpacing || screenX > rect.width + scaledSpacing) continue

          ctx.beginPath()
          ctx.moveTo(screenX, 0)
          ctx.lineTo(screenX, rect.height)
          ctx.stroke()
        }

        // Horizontal lines
        for (let j = startRow; j <= endRow; j++) {
          const screenY = j * scaledSpacing + offsetY
          if (screenY < -scaledSpacing || screenY > rect.height + scaledSpacing) continue

          ctx.beginPath()
          ctx.moveTo(0, screenY)
          ctx.lineTo(rect.width, screenY)
          ctx.stroke()
        }
      }
    }

    resizeCanvas()
    draw()

    const handleResize = () => {
      resizeCanvas()
      draw()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [pattern, spacing, zoom, offsetX, offsetY])

  if (pattern === 'none') return null

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
    </div>
  )
}
