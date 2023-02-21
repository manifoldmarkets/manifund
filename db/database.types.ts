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
          type: Database["public"]["Enums"]["bid_type"]
          valuation: number
        }
        Insert: {
          amount: number
          bidder: string
          created_at?: string | null
          id?: string
          project: string
          type?: Database["public"]["Enums"]["bid_type"]
          valuation: number
        }
        Update: {
          amount?: number
          bidder?: string
          created_at?: string | null
          id?: string
          project?: string
          type?: Database["public"]["Enums"]["bid_type"]
          valuation?: number
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
        }
        Insert: {
          id: string
          username: string
        }
        Update: {
          id?: string
          username?: string
        }
      }
      projects: {
        Row: {
          auction_close: string
          blurb: string | null
          created_at: string | null
          creator: string
          description: Json | null
          founder_portion: number
          id: string
          min_funding: number
          round: string
          slug: string
          stage: string
          title: string | null
        }
        Insert: {
          auction_close?: string
          blurb?: string | null
          created_at?: string | null
          creator: string
          description?: Json | null
          founder_portion: number
          id?: string
          min_funding: number
          round?: string
          slug?: string
          stage?: string
          title?: string | null
        }
        Update: {
          auction_close?: string
          blurb?: string | null
          created_at?: string | null
          creator?: string
          description?: Json | null
          founder_portion?: number
          id?: string
          min_funding?: number
          round?: string
          slug?: string
          stage?: string
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
      users: {
        Row: {
          email: string | null
          id: string | null
        }
        Insert: {
          email?: string | null
          id?: string | null
        }
        Update: {
          email?: string | null
          id?: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      bid_type: "buy" | "sell" | "ipo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
