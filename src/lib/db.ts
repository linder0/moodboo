import { NextResponse } from 'next/server'
import { createServerClient } from './supabase'

/**
 * Database helper utilities for API routes.
 * Reduces boilerplate for common Supabase operations.
 */

type SupabaseTable = 'boards' | 'reference_cards' | 'card_groups' | 'connections'

interface QueryOptions {
  /** Column to filter by */
  filterColumn?: string
  /** Value to filter */
  filterValue?: string
  /** Column to order by */
  orderBy?: string
  /** Order direction */
  orderDir?: 'asc' | 'desc'
  /** Limit results */
  limit?: number
}

/**
 * Fetch records from a table with common options.
 * Returns { data, error, response } where response is a NextResponse if there was an error.
 */
export async function fetchFromTable<T = unknown>(
  table: SupabaseTable,
  options: QueryOptions = {}
): Promise<{ data: T[] | null; error: Error | null; response?: NextResponse }> {
  try {
    const supabase = createServerClient()
    let query = supabase.from(table).select('*')

    if (options.filterColumn && options.filterValue) {
      query = query.eq(options.filterColumn, options.filterValue)
    }

    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.orderDir !== 'desc' })
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error(`Error fetching from ${table}:`, error)
      return {
        data: null,
        error,
        response: NextResponse.json({ error: `Failed to fetch ${table}` }, { status: 500 }),
      }
    }

    return { data: data as T[], error: null }
  } catch (error) {
    console.error(`Error in fetchFromTable(${table}):`, error)
    return {
      data: null,
      error: error as Error,
      response: NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    }
  }
}

/**
 * Fetch a single record by ID.
 * Returns { data, error, response } where response is a NextResponse if there was an error.
 */
export async function fetchById<T = unknown>(
  table: SupabaseTable,
  id: string
): Promise<{ data: T | null; error: Error | null; response?: NextResponse }> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          data: null,
          error,
          response: NextResponse.json({ error: `${table.slice(0, -1)} not found` }, { status: 404 }),
        }
      }
      console.error(`Error fetching ${table} by ID:`, error)
      return {
        data: null,
        error,
        response: NextResponse.json({ error: `Failed to fetch ${table.slice(0, -1)}` }, { status: 500 }),
      }
    }

    return { data: data as T, error: null }
  } catch (error) {
    console.error(`Error in fetchById(${table}, ${id}):`, error)
    return {
      data: null,
      error: error as Error,
      response: NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    }
  }
}

/**
 * Insert a record into a table.
 * Returns { data, error, response } where response is a NextResponse if there was an error.
 */
export async function insertRecord<T = unknown>(
  table: SupabaseTable,
  record: Record<string, unknown>
): Promise<{ data: T | null; error: Error | null; response?: NextResponse }> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from(table)
      .insert(record)
      .select()
      .single()

    if (error) {
      console.error(`Error inserting into ${table}:`, error)
      return {
        data: null,
        error,
        response: NextResponse.json({ error: `Failed to create ${table.slice(0, -1)}` }, { status: 500 }),
      }
    }

    return { data: data as T, error: null }
  } catch (error) {
    console.error(`Error in insertRecord(${table}):`, error)
    return {
      data: null,
      error: error as Error,
      response: NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    }
  }
}

/**
 * Update a record by ID.
 * Returns { data, error, response } where response is a NextResponse if there was an error.
 */
export async function updateRecord<T = unknown>(
  table: SupabaseTable,
  id: string,
  updates: Record<string, unknown>
): Promise<{ data: T | null; error: Error | null; response?: NextResponse }> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          data: null,
          error,
          response: NextResponse.json({ error: `${table.slice(0, -1)} not found` }, { status: 404 }),
        }
      }
      console.error(`Error updating ${table}:`, error)
      return {
        data: null,
        error,
        response: NextResponse.json({ error: `Failed to update ${table.slice(0, -1)}` }, { status: 500 }),
      }
    }

    return { data: data as T, error: null }
  } catch (error) {
    console.error(`Error in updateRecord(${table}, ${id}):`, error)
    return {
      data: null,
      error: error as Error,
      response: NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    }
  }
}

/**
 * Delete a record by ID.
 * Returns { error, response } where response is a NextResponse if there was an error.
 */
export async function deleteRecord(
  table: SupabaseTable,
  id: string
): Promise<{ error: Error | null; response?: NextResponse }> {
  try {
    const supabase = createServerClient()

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Error deleting from ${table}:`, error)
      return {
        error,
        response: NextResponse.json({ error: `Failed to delete ${table.slice(0, -1)}` }, { status: 500 }),
      }
    }

    return { error: null }
  } catch (error) {
    console.error(`Error in deleteRecord(${table}, ${id}):`, error)
    return {
      error: error as Error,
      response: NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    }
  }
}
