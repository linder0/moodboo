import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { updateGroupSchema } from '@/lib/schemas'
import { handleApiError } from '@/lib/api-utils'

// GET /api/groups/[id] - Get a single group with its cards
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    // Get group
    const { data: group, error: groupError } = await supabase
      .from('card_groups')
      .select('*')
      .eq('id', id)
      .single()

    if (groupError || !group) {
      if (groupError?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }
      console.error('Error fetching group:', groupError)
      return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 })
    }

    // Get cards in this group
    const { data: cards, error: cardsError } = await supabase
      .from('reference_cards')
      .select('id')
      .eq('group_id', id)

    if (cardsError) {
      console.error('Error fetching group cards:', cardsError)
    }

    return NextResponse.json({
      ...group,
      card_ids: (cards || []).map((c: { id: string }) => c.id),
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/groups/[id]')
  }
}

// PATCH /api/groups/[id] - Update a group
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateGroupSchema.parse(body)

    const supabase = createServerClient()

    const { data: group, error } = await supabase
      .from('card_groups')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }
      console.error('Error updating group:', error)
      return NextResponse.json({ error: 'Failed to update group' }, { status: 500 })
    }

    return NextResponse.json(group)
  } catch (error) {
    return handleApiError(error, 'PATCH /api/groups/[id]')
  }
}

// DELETE /api/groups/[id] - Delete a group (cards are unlinked, not deleted)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    // First unlink all cards from this group (set group_id to null)
    await supabase
      .from('reference_cards')
      .update({ group_id: null })
      .eq('group_id', id)

    // Then delete the group
    const { error } = await supabase
      .from('card_groups')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting group:', error)
      return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/groups/[id]')
  }
}
