'use client'

import { useState, useMemo } from 'react'
import { ReferenceCard, BoardAesthetic, CardAnalysis } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Sparkles, Palette, Sun, Tag, Loader2 } from 'lucide-react'

interface AestheticWidgetProps {
  cards: ReferenceCard[]
  className?: string
}

// Check if an analysis object is valid and complete
function isValidAnalysis(analysis: CardAnalysis | null | undefined): analysis is CardAnalysis {
  if (!analysis) return false
  return (
    Array.isArray(analysis.palette) &&
    Array.isArray(analysis.mood) &&
    analysis.lighting &&
    typeof analysis.lighting.type === 'string' &&
    typeof analysis.lighting.quality === 'string'
  )
}

// Aggregate card analyses into board-level aesthetic summary
function aggregateBoardAesthetic(cards: ReferenceCard[]): BoardAesthetic | null {
  const analyzedCards = cards.filter((c) => isValidAnalysis(c.analysis))

  if (analyzedCards.length === 0) {
    return null
  }

  // Collect all colors from all cards
  const allColors: string[] = []
  const allMoods: string[] = []
  const lightingTypes: Record<string, number> = {}
  const lightingQualities: Record<string, number> = {}

  for (const card of analyzedCards) {
    const analysis = card.analysis as CardAnalysis

    // Colors
    if (analysis.palette?.length) {
      allColors.push(...analysis.palette)
    }

    // Moods
    if (analysis.mood?.length) {
      allMoods.push(...analysis.mood)
    }

    // Lighting
    if (analysis.lighting?.type) {
      lightingTypes[analysis.lighting.type] = (lightingTypes[analysis.lighting.type] || 0) + 1
    }
    if (analysis.lighting?.quality) {
      lightingQualities[analysis.lighting.quality] = (lightingQualities[analysis.lighting.quality] || 0) + 1
    }
  }

  // Get top 6 colors (by frequency using simple grouping)
  const colorCounts = allColors.reduce((acc, color) => {
    // Normalize similar colors (simple hex grouping)
    const normalizedColor = color.toLowerCase()
    acc[normalizedColor] = (acc[normalizedColor] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const dominantPalette = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([color]) => color)

  // Get unique mood keywords (top 8 by frequency)
  const moodCounts = allMoods.reduce((acc, mood) => {
    const normalizedMood = mood.toLowerCase()
    acc[normalizedMood] = (acc[normalizedMood] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const moodKeywords = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([mood]) => mood)

  // Determine dominant lighting profile
  const dominantLightType = Object.entries(lightingTypes)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'mixed'
  const dominantLightQuality = Object.entries(lightingQualities)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'soft'

  const lightingProfile = `Predominantly ${dominantLightQuality} ${dominantLightType} light`

  // Generate style signature from mood keywords
  const styleSignature = moodKeywords.slice(0, 3).join(' · ')

  return {
    dominantPalette,
    lightingProfile,
    moodKeywords,
    styleSignature,
    cardCount: cards.length,
    analyzedCount: analyzedCards.length,
  }
}

export function AestheticWidget({ cards, className }: AestheticWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const aesthetic = useMemo(() => aggregateBoardAesthetic(cards), [cards])

  const analyzedCount = cards.filter((c) => isValidAnalysis(c.analysis)).length
  const totalImageCards = cards.filter((c) => c.type === 'image' || (c.type === 'link' && c.thumbnail_url)).length
  const isAnalyzing = analyzedCount < totalImageCards

  // No aesthetic data yet
  if (!aesthetic && !isAnalyzing) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl',
        'transition-all duration-300 ease-out',
        isExpanded ? 'w-80' : 'w-auto',
        className
      )}
    >
      {/* Collapsed State - Pill with palette preview */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-3 p-3',
          'hover:bg-muted/30 transition-colors rounded-xl',
          'focus:outline-none focus:ring-2 focus:ring-ring/50'
        )}
      >
        {/* Palette dots preview */}
        <div className="flex items-center gap-1">
          {aesthetic?.dominantPalette.slice(0, 5).map((color, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full border border-white/10 shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
          {!aesthetic && isAnalyzing && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Analyzing...</span>
            </div>
          )}
        </div>

        {/* Expand/collapse indicator */}
        {aesthetic && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">
              {aesthetic.analyzedCount}/{aesthetic.cardCount}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        )}
      </button>

      {/* Expanded State - Full panel */}
      {isExpanded && aesthetic && (
        <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Style Signature */}
          <div className="flex items-center gap-2 pt-1 border-t border-border/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-foreground">
              {aesthetic.styleSignature || 'Analyzing aesthetic...'}
            </span>
          </div>

          {/* Full Palette */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Palette className="w-3.5 h-3.5" />
              <span>Dominant Palette</span>
            </div>
            <div className="flex gap-1.5">
              {aesthetic.dominantPalette.map((color, i) => (
                <div key={i} className="group relative">
                  <div
                    className="w-8 h-8 rounded-lg border border-white/10 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    {color.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lighting Profile */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sun className="w-3.5 h-3.5" />
              <span>Lighting</span>
            </div>
            <p className="text-sm text-foreground/90">{aesthetic.lightingProfile}</p>
          </div>

          {/* Mood Keywords */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Tag className="w-3.5 h-3.5" />
              <span>Mood</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {aesthetic.moodKeywords.map((mood, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-xs bg-muted/50 text-muted-foreground rounded-full"
                >
                  {mood}
                </span>
              ))}
            </div>
          </div>

          {/* Analysis progress */}
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/30">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>
                Analyzing {totalImageCards - analyzedCount} more{' '}
                {totalImageCards - analyzedCount === 1 ? 'image' : 'images'}...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
