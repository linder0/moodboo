import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { updateBoardSchema } from '@/lib/schemas'
import { handleApiError } from '@/lib/api-utils'

// GET /api/boards/[id] - Get a single board with its cards
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    // Get board
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', id)
      .single()

    if (boardError || !board) {
      if (boardError?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Board not found' }, { status: 404 })
      }
      console.error('Error fetching board:', boardError)
      return NextResponse.json({ error: 'Failed to fetch board' }, { status: 500 })
    }

    // Get cards for this board
    const { data: cards, error: cardsError } = await supabase
      .from('reference_cards')
      .select('*')
      .eq('board_id', id)
      .order('position', { ascending: true })

    if (cardsError) {
      console.error('Error fetching cards:', cardsError)
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
    }

    return NextResponse.json({
      id: board.id,
      title: board.title,
      description: board.description,
      created_at: board.created_at,
      updated_at: board.updated_at,
      cards: cards || [],
    })
  } catch (error) {
    console.error('Error in GET /api/boards/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/boards/[id] - Update a board
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateBoardSchema.parse(body)

    const supabase = createServerClient()

    const { data: board, error } = await supabase
      .from('boards')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Board not found' }, { status: 404 })
      }
      console.error('Error updating board:', error)
      return NextResponse.json({ error: 'Failed to update board' }, { status: 500 })
    }

    return NextResponse.json(board)
  } catch (error) {
    return handleApiError(error, 'PATCH /api/boards/[id]')
  }
}

// DELETE /api/boards/[id] - Delete a board
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting board:', error)
      return NextResponse.json({ error: 'Failed to delete board' }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error in DELETE /api/boards/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
