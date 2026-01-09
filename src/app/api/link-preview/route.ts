import { NextRequest, NextResponse } from 'next/server'
import ogs from 'open-graph-scraper'

// POST /api/link-preview - Fetch OpenGraph data for a URL
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

    // Fetch OpenGraph data
    const { error, result } = await ogs({
      url,
      timeout: 10000,
      fetchOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CreativeCanvas/1.0)',
        },
      },
    })

    if (error) {
      console.error('OGS error:', result)
      // Return basic info even if OG scraping fails
      return NextResponse.json({
        title: new URL(url).hostname,
        description: null,
        image: null,
        siteName: new URL(url).hostname,
        url,
      })
    }

    // Extract the best image
    let imageUrl: string | null = null
    if (result.ogImage && result.ogImage.length > 0) {
      imageUrl = result.ogImage[0].url
    } else if (result.twitterImage && result.twitterImage.length > 0) {
      imageUrl = result.twitterImage[0].url
    }

    return NextResponse.json({
      title: result.ogTitle || result.twitterTitle || result.dcTitle || new URL(url).hostname,
      description: result.ogDescription || result.twitterDescription || result.dcDescription || null,
      image: imageUrl,
      siteName: result.ogSiteName || new URL(url).hostname,
      url: result.ogUrl || url,
    })
  } catch (error) {
    console.error('Error in POST /api/link-preview:', error)
    // Return basic info on error
    try {
      const { url } = await request.clone().json()
      return NextResponse.json({
        title: new URL(url).hostname,
        description: null,
        image: null,
        siteName: new URL(url).hostname,
        url,
      })
    } catch {
      return NextResponse.json({ error: 'Failed to fetch link preview' }, { status: 500 })
    }
  }
}

