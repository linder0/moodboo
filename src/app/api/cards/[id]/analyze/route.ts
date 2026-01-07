import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getOpenAI } from '@/lib/openai'
import { VISION_ANALYSIS_SYSTEM_PROMPT, VISION_ANALYSIS_USER_PROMPT } from '@/lib/prompts'
import { cardAnalysisSchema, CARD_ANALYSIS_JSON_SCHEMA } from '@/lib/schemas'

// POST /api/cards/[id]/analyze - Analyze a card's image with GPT-4o Vision
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cardId } = await params

    const supabase = createServerClient()

    // Fetch the card
    const { data: card, error: cardError } = await supabase
      .from('reference_cards')
      .select('*')
      .eq('id', cardId)
      .single()

    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Check if card has an image to analyze
    if (!card.thumbnail_url) {
      return NextResponse.json(
        { error: 'Card has no image to analyze' },
        { status: 400 }
      )
    }

    // Check if card type supports analysis
    if (card.type !== 'image' && card.type !== 'link') {
      return NextResponse.json(
        { error: 'Card type does not support vision analysis' },
        { status: 400 }
      )
    }

    const openai = getOpenAI()

    // Call GPT-4o Vision
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: VISION_ANALYSIS_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: VISION_ANALYSIS_USER_PROMPT(card.title, card.notes),
            },
            {
              type: 'image_url',
              image_url: {
                url: card.thumbnail_url,
                detail: 'low', // Use low detail to reduce tokens
              },
            },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'card_analysis',
          schema: CARD_ANALYSIS_JSON_SCHEMA,
          strict: true,
        },
      },
      max_tokens: 1024,
      temperature: 0.3,
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from AI')
    }

    // Parse and validate the response
    let analysis
    try {
      analysis = JSON.parse(responseText)
      // Validate with Zod
      cardAnalysisSchema.parse(analysis)
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('Raw response:', responseText)
      return NextResponse.json(
        { error: 'Invalid AI response format' },
        { status: 500 }
      )
    }

    // Save the analysis to the card
    const { error: updateError } = await supabase
      .from('reference_cards')
      .update({ analysis })
      .eq('id', cardId)

    if (updateError) {
      console.error('Error saving analysis:', updateError)
      return NextResponse.json(
        { error: 'Failed to save analysis' },
        { status: 500 }
      )
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Error in POST /api/cards/[id]/analyze:', error)

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        )
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limited. Please try again in a moment.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}

// GET /api/cards/[id]/analyze - Get existing analysis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cardId } = await params

    const supabase = createServerClient()

    const { data: card, error } = await supabase
      .from('reference_cards')
      .select('id, analysis')
      .eq('id', cardId)
      .single()

    if (error || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    return NextResponse.json({ analysis: card.analysis })
  } catch (error) {
    console.error('Error in GET /api/cards/[id]/analyze:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
