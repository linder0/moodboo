import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createConnectionSchema } from '@/lib/schemas'
import { handleApiError } from '@/lib/api-utils'

// GET /api/connections?board_id=xxx - Get all connections for a board
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('board_id')

    if (!boardId) {
      return NextResponse.json({ error: 'board_id is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: connections, error } = await supabase
      .from('connections')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching connections:', error)
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
    }

    return NextResponse.json(connections || [])
  } catch (error) {
    return handleApiError(error, 'GET /api/connections')
  }
}

// POST /api/connections - Create a new connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createConnectionSchema.parse(body)

    const supabase = createServerClient()

    // Check that source and target cards exist and belong to the same board
    const { data: cards, error: cardsError } = await supabase
      .from('reference_cards')
      .select('id, board_id')
      .in('id', [validatedData.from_card_id, validatedData.to_card_id])

    if (cardsError || !cards || cards.length !== 2) {
      return NextResponse.json({ error: 'Invalid source or target card' }, { status: 400 })
    }

    // Verify both cards belong to the specified board
    if (!cards.every(card => card.board_id === validatedData.board_id)) {
      return NextResponse.json({ error: 'Cards must belong to the specified board' }, { status: 400 })
    }

    const { data: connection, error } = await supabase
      .from('connections')
      .insert({
        board_id: validatedData.board_id,
        from_card_id: validatedData.from_card_id,
        to_card_id: validatedData.to_card_id,
        label: validatedData.label,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating connection:', error)
      return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
    }

    return NextResponse.json(connection, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'POST /api/connections')
  }
}
