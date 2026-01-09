import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createGroupSchema } from '@/lib/schemas'
import { handleApiError } from '@/lib/api-utils'

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { card_ids, ...validatedData } = createGroupSchema.parse(body)

    const supabase = createServerClient()

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('card_groups')
      .insert(validatedData)
      .select()
      .single()

    if (groupError) {
      console.error('Error creating group:', groupError)
      return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
    }

    // If card_ids provided, update cards to belong to this group
    if (card_ids && card_ids.length > 0) {
      const { error: updateError } = await supabase
        .from('reference_cards')
        .update({ group_id: group.id })
        .in('id', card_ids)

      if (updateError) {
        console.error('Error assigning cards to group:', updateError)
        // Don't fail the request, group was created successfully
      }
    }

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'POST /api/groups')
  }
}

// GET /api/groups - List groups for a board
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('board_id')

    if (!boardId) {
      return NextResponse.json({ error: 'board_id is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: groups, error } = await supabase
      .from('card_groups')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching groups:', error)
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
    }

    return NextResponse.json(groups || [])
  } catch (error) {
    return handleApiError(error, 'GET /api/groups')
  }
}
