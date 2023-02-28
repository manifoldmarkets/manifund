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
      comments: {
        Row: {
          commenter: string
          content: Json | null
          created_at: string
          id: string
          project: string
        }
        Insert: {
          commenter: string
          content?: Json | null
          created_at?: string
          id?: string
          project: string
        }
        Update: {
          commenter?: string
          content?: Json | null
          created_at?: string
          id?: string
          project?: string
        }
      }
      profiles: {
        Row: {
          accreditation_status: boolean
          avatar_url: string | null
          bio: string
          full_name: string
          id: string
          username: string
          website: string | null
        }
        Insert: {
          accreditation_status?: boolean
          avatar_url?: string | null
          bio?: string
          full_name?: string
          id: string
          username: string
          website?: string | null
        }
        Update: {
          accreditation_status?: boolean
          avatar_url?: string | null
          bio?: string
          full_name?: string
          id?: string
          username?: string
          website?: string | null
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
          title: string
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
          title?: string
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
          title?: string
        }
      }
      txns: {
        Row: {
          amount: number
          created_at: string
          from_id: string | null
          id: string
          project: string | null
          to_id: string
          token: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_id?: string | null
          id?: string
          project?: string | null
          to_id: string
          token: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_id?: string | null
          id?: string
          project?: string | null
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
