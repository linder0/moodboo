export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string
          title: string
          description: string | null
          synthesis_output: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          synthesis_output?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          synthesis_output?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      reference_cards: {
        Row: {
          id: string
          board_id: string
          type: string
          source: string
          title: string
          thumbnail_url: string | null
          url: string | null
          file_path: string | null
          user_note: string | null
          tags: string[]
          role: string | null
          pinned: boolean
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          board_id: string
          type: string
          source: string
          title: string
          thumbnail_url?: string | null
          url?: string | null
          file_path?: string | null
          user_note?: string | null
          tags?: string[]
          role?: string | null
          pinned?: boolean
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          type?: string
          source?: string
          title?: string
          thumbnail_url?: string | null
          url?: string | null
          file_path?: string | null
          user_note?: string | null
          tags?: string[]
          role?: string | null
          pinned?: boolean
          position?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
