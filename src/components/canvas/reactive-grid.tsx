'use client'

import { useEffect, useRef } from 'react'

interface ReactiveGridProps {
  dotSize?: number
  dotSpacing?: number
  dotColor?: string
  glowRadius?: number
  zoom?: number
  offsetX?: number
  offsetY?: number
}

export function ReactiveGrid({
  dotSize = 1.2,
  dotSpacing = 32,
  dotColor = 'rgba(255, 255, 255, 0.12)',
  glowRadius = 120,
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
}: ReactiveGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const targetMouseRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let currentScale = 1

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      currentScale = dpr
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Track mouse with smooth interpolation - listen on window
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      // Check if mouse is over our container area
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        targetMouseRef.current = { x, y }
      } else {
        // Smoothly move away when outside
        targetMouseRef.current = { x: -1000, y: -1000 }
      }
    }

    // Listen on window to track mouse even with pointer-events-none
    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      const rect = container.getBoundingClientRect()

      // Smooth mouse position interpolation
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.15
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.15

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Calculate grid bounds in canvas space (accounting for zoom and offset)
      const scaledSpacing = dotSpacing * zoom
      const scaledDotSize = dotSize * zoom

      // Calculate which dots are visible
      const startCol = Math.floor(-offsetX / scaledSpacing) - 1
      const startRow = Math.floor(-offsetY / scaledSpacing) - 1
      const endCol = Math.ceil((rect.width - offsetX) / scaledSpacing) + 1
      const endRow = Math.ceil((rect.height - offsetY) / scaledSpacing) + 1

      for (let i = startCol; i <= endCol; i++) {
        for (let j = startRow; j <= endRow; j++) {
          // Screen position of this dot
          const screenX = i * scaledSpacing + offsetX
          const screenY = j * scaledSpacing + offsetY

          // Skip if off screen
          if (screenX < -scaledSpacing || screenX > rect.width + scaledSpacing ||
              screenY < -scaledSpacing || screenY > rect.height + scaledSpacing) {
            continue
          }

          // Calculate distance from mouse (in screen space)
          const dx = screenX - mouseRef.current.x
          const dy = screenY - mouseRef.current.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Calculate intensity based on distance
          const intensity = Math.max(0, 1 - distance / glowRadius)
          const easeIntensity = intensity * intensity * (3 - 2 * intensity) // smoothstep

          // Subtle opacity change only - constant size
          const alpha = 0.12 + easeIntensity * 0.15

          ctx.beginPath()
          ctx.arc(screenX, screenY, scaledDotSize, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
          ctx.fill()
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dotSize, dotSpacing, dotColor, glowRadius, zoom, offsetX, offsetY])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
    </div>
  )
}
