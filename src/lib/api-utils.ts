import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Standardized API error handler for route handlers.
 * Handles Zod validation errors and generic errors consistently.
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
  }
  console.error(`Error in ${context}:`, error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
