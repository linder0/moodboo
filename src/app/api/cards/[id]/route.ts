import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { updateCardSchema } from '@/lib/schemas'
import { handleApiError } from '@/lib/api-utils'

// GET /api/cards/[id] - Get a single card
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { data: card, error } = await supabase
      .from('reference_cards')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Card not found' }, { status: 404 })
      }
      console.error('Error fetching card:', error)
      return NextResponse.json({ error: 'Failed to fetch card' }, { status: 500 })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error in GET /api/cards/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/cards/[id] - Update a card
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateCardSchema.parse(body)

    const supabase = createServerClient()

    const { data: card, error } = await supabase
      .from('reference_cards')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Card not found' }, { status: 404 })
      }
      console.error('Error updating card:', error)
      return NextResponse.json({ error: 'Failed to update card' }, { status: 500 })
    }

    return NextResponse.json(card)
  } catch (error) {
    return handleApiError(error, 'PATCH /api/cards/[id]')
  }
}

// DELETE /api/cards/[id] - Delete a card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    // Get the card first to check if it has a file
    const { data: card } = await supabase
      .from('reference_cards')
      .select('file_path')
      .eq('id', id)
      .single()

    // Delete the file from storage if it exists
    if (card?.file_path) {
      await supabase.storage.from('references').remove([card.file_path])
    }

    const { error } = await supabase
      .from('reference_cards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting card:', error)
      return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error in DELETE /api/cards/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
