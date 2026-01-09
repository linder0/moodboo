import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createCardSchema } from '@/lib/schemas'
import { handleApiError } from '@/lib/api-utils'

// GET /api/cards?board_id=xxx - List cards for a board
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const boardId = searchParams.get('board_id')

    if (!boardId) {
      return NextResponse.json({ error: 'board_id is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: cards, error } = await supabase
      .from('reference_cards')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching cards:', error)
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
    }

    return NextResponse.json(cards)
  } catch (error) {
    return handleApiError(error, 'GET /api/cards')
  }
}

// POST /api/cards - Create a new reference card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createCardSchema.parse(body)

    const supabase = createServerClient()

    // Get the highest position for this board
    const { data: existingCards } = await supabase
      .from('reference_cards')
      .select('position')
      .eq('board_id', validatedData.board_id)
      .order('position', { ascending: false })
      .limit(1)

    const nextPosition = existingCards && existingCards.length > 0
      ? existingCards[0].position + 1
      : 0

    const { data: card, error } = await supabase
      .from('reference_cards')
      .insert({
        ...validatedData,
        position: nextPosition,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating card:', error)
      return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
    }

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'POST /api/cards')
  }
}
