import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { updateConnectionSchema } from '@/lib/schemas'

// PATCH /api/connections/[id] - Update a connection
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateConnectionSchema.parse(body)

    const supabase = createServerClient()

    const { data: connection, error } = await supabase
      .from('connections')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
      }
      console.error('Error updating connection:', error)
      return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 })
    }

    return NextResponse.json(connection)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    console.error('Error in PATCH /api/connections/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/connections/[id] - Delete a connection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting connection:', error)
      return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error in DELETE /api/connections/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
