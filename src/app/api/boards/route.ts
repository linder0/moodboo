import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createBoardSchema } from '@/lib/schemas'

// GET /api/boards - List all boards
export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: boards, error } = await supabase
      .from('boards')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching boards:', error)
      return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 })
    }

    return NextResponse.json(boards)
  } catch (error) {
    console.error('Error in GET /api/boards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/boards - Create a new board
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createBoardSchema.parse(body)

    const supabase = createServerClient()

    const { data: board, error } = await supabase
      .from('boards')
      .insert({
        title: validatedData.title,
        description: validatedData.description || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating board:', error)
      return NextResponse.json({ error: 'Failed to create board' }, { status: 500 })
    }

    return NextResponse.json(board, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    console.error('Error in POST /api/boards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
