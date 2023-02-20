export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bids: {
        Row: {
          amount: number
          bidder: string
          created_at: string | null
          id: string
          project: string
          valuation: number
        }
        Insert: {
          amount: number
          bidder: string
          created_at?: string | null
          id?: string
          project: string
          valuation: number
        }
        Update: {
          amount?: number
          bidder?: string
          created_at?: string | null
          id?: string
          project?: string
          valuation?: number
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
        }
        Insert: {
          id: string
          username?: string | null
        }
        Update: {
          id?: string
          username?: string | null
        }
      }
      projects: {
        Row: {
          blurb: string | null
          created_at: string | null
          creator: string
          description: Json | null
          founder_portion: number
          id: string
          min_funding: number
          slug: string
          title: string | null
        }
        Insert: {
          blurb?: string | null
          created_at?: string | null
          creator: string
          description?: Json | null
          founder_portion: number
          id?: string
          min_funding: number
          slug?: string
          title?: string | null
        }
        Update: {
          blurb?: string | null
          created_at?: string | null
          creator?: string
          description?: Json | null
          founder_portion?: number
          id?: string
          min_funding?: number
          slug?: string
          title?: string | null
        }
      }
      txns: {
        Row: {
          amount: number
          created_at: string
          from_id: string | null
          id: string
          to_id: string
          token: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_id?: string | null
          id?: string
          to_id: string
          token: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_id?: string | null
          id?: string
          to_id?: string
          token?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
