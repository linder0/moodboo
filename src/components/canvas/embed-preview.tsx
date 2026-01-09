'use client'

import { memo, useMemo } from 'react'
import { ExternalLink } from 'lucide-react'

interface EmbedPreviewProps {
  url: string
  source: string
  className?: string
}

// Extract video ID from TikTok URL
function getTikTokVideoId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/)
  return match ? match[1] : null
}

// Extract video ID from YouTube URL
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Extract tweet ID from Twitter/X URL
function getTweetId(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/)
  return match ? match[1] : null
}

export const EmbedPreview = memo(function EmbedPreview({ url, source, className = '' }: EmbedPreviewProps) {
  const embedContent = useMemo(() => {
    switch (source) {
      case 'tiktok': {
        const videoId = getTikTokVideoId(url)
        if (!videoId) return null
        return (
          <iframe
            src={`https://www.tiktok.com/embed/v2/${videoId}`}
            className="w-full h-full border-0 block"
            style={{ margin: 0, padding: 0 }}
            allowFullScreen
            allow="encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        )
      }

      case 'youtube': {
        const videoId = getYouTubeVideoId(url)
        if (!videoId) return null
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
            className="w-full h-full border-0 block"
            style={{ margin: 0, padding: 0 }}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )
      }

      case 'twitter': {
        // Twitter embeds are complex, show a styled link instead
        const tweetId = getTweetId(url)
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white p-4">
            <span className="text-3xl mb-2">𝕏</span>
            <span className="text-xs opacity-70">Tweet</span>
            {tweetId && <span className="text-[10px] opacity-50 mt-1">#{tweetId.slice(-6)}</span>}
          </div>
        )
      }

      default:
        return null
    }
  }, [url, source])

  if (!embedContent) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <ExternalLink className="w-8 h-8 text-gray-400" />
      </a>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {embedContent}
    </div>
  )
})
