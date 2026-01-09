import { NextRequest, NextResponse } from 'next/server'

// oEmbed endpoints for supported platforms
const OEMBED_ENDPOINTS: Record<string, string> = {
  tiktok: 'https://www.tiktok.com/oembed',
  youtube: 'https://www.youtube.com/oembed',
  twitter: 'https://publish.twitter.com/oembed',
}

// Detect platform from URL
function detectPlatform(url: string): string | null {
  const hostname = new URL(url).hostname.toLowerCase()

  if (hostname.includes('tiktok.com')) return 'tiktok'
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube'
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter'

  return null
}

export interface OEmbedResponse {
  platform: string
  title: string
  thumbnail_url: string | null
  embed_html: string | null
  author_name: string | null
  author_url: string | null
}

// POST /api/oembed - Fetch oEmbed data for a URL
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const platform = detectPlatform(url)

    if (!platform) {
      return NextResponse.json({
        platform: null,
        title: null,
        thumbnail_url: null,
        embed_html: null,
        author_name: null,
        author_url: null,
      })
    }

    const oembedEndpoint = OEMBED_ENDPOINTS[platform]
    const oembedUrl = `${oembedEndpoint}?url=${encodeURIComponent(url)}&format=json`

    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Moodboard/1.0)',
      },
    })

    if (!response.ok) {
      console.error(`oEmbed error for ${platform}:`, response.status)
      return NextResponse.json({
        platform,
        title: null,
        thumbnail_url: null,
        embed_html: null,
        author_name: null,
        author_url: null,
      })
    }

    const data = await response.json()

    return NextResponse.json({
      platform,
      title: data.title || null,
      thumbnail_url: data.thumbnail_url || null,
      embed_html: data.html || null,
      author_name: data.author_name || null,
      author_url: data.author_url || null,
    } satisfies OEmbedResponse)

  } catch (error) {
    console.error('Error in POST /api/oembed:', error)
    return NextResponse.json({ error: 'Failed to fetch oEmbed data' }, { status: 500 })
  }
}

