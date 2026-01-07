import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// POST /api/upload - Upload a file to Supabase storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const boardId = formData.get('board_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!boardId) {
      return NextResponse.json({ error: 'board_id is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'bin'
    const filename = `${boardId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('references')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Error uploading file:', error)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('references')
      .getPublicUrl(data.path)

    return NextResponse.json({
      path: data.path,
      url: urlData.publicUrl,
      filename: file.name,
      contentType: file.type,
    })
  } catch (error) {
    console.error('Error in POST /api/upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
