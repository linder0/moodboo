import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getOpenAI } from '@/lib/openai'
import { CHAT_SYSTEM_PROMPT, CHAT_USER_PROMPT } from '@/lib/prompts'
import { chatResponseSchema, CHAT_RESPONSE_JSON_SCHEMA } from '@/lib/schemas'

// POST /api/chat - Chat with the moodboard AI
export async function POST(request: NextRequest) {
  try {
    const { boardId, message } = await request.json()

    if (!boardId) {
      return NextResponse.json({ error: 'boardId is required' }, { status: 400 })
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Fetch the board
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id, title')
      .eq('id', boardId)
      .single()

    if (boardError || !board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 })
    }

    // Fetch all cards with their analyses
    const { data: cards, error: cardsError } = await supabase
      .from('reference_cards')
      .select('id, title, user_note, analysis, thumbnail_url, type')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    if (cardsError) {
      console.error('Error fetching cards:', cardsError)
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
    }

    // Prepare cards context for the prompt
    const cardsContext = (cards || []).map((card) => ({
      id: card.id,
      title: card.title,
      notes: card.user_note,
      analysis: card.analysis,
    }))

    const openai = getOpenAI()

    // Call GPT-4o
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        {
          role: 'user',
          content: CHAT_USER_PROMPT(message, board.title, cardsContext),
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'chat_response',
          schema: CHAT_RESPONSE_JSON_SCHEMA,
          strict: true,
        },
      },
      max_tokens: 2048,
      temperature: 0.7,
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from AI')
    }

    // Parse and validate the response
    let chatResponse
    try {
      chatResponse = JSON.parse(responseText)
      // Validate with Zod
      chatResponseSchema.parse(chatResponse)
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('Raw response:', responseText)
      return NextResponse.json(
        { error: 'Invalid AI response format' },
        { status: 500 }
      )
    }

    return NextResponse.json(chatResponse)
  } catch (error) {
    console.error('Error in POST /api/chat:', error)

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
      { error: 'Chat failed. Please try again.' },
      { status: 500 }
    )
  }
}
