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
          created_at: string
          id: string
          project: string
          status: Database["public"]["Enums"]["bid_status"]
          type: Database["public"]["Enums"]["bid_type"]
          valuation: number
        }
        Insert: {
          amount: number
          bidder: string
          created_at?: string
          id?: string
          project: string
          status?: Database["public"]["Enums"]["bid_status"]
          type?: Database["public"]["Enums"]["bid_type"]
          valuation: number
        }
        Update: {
          amount?: number
          bidder?: string
          created_at?: string
          id?: string
          project?: string
          status?: Database["public"]["Enums"]["bid_status"]
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
          replying_to: string | null
        }
        Insert: {
          commenter: string
          content?: Json | null
          created_at?: string
          id?: string
          project: string
          replying_to?: string | null
        }
        Update: {
          commenter?: string
          content?: Json | null
          created_at?: string
          id?: string
          project?: string
          replying_to?: string | null
        }
      }
      profiles: {
        Row: {
          accreditation_status: boolean
          avatar_url: string | null
          bio: string
          full_name: string
          id: string
          long_description: Json | null
          regranter_status: boolean
          type: Database["public"]["Enums"]["profile_type"]
          username: string
          website: string | null
        }
        Insert: {
          accreditation_status?: boolean
          avatar_url?: string | null
          bio?: string
          full_name?: string
          id?: string
          long_description?: Json | null
          regranter_status?: boolean
          type?: Database["public"]["Enums"]["profile_type"]
          username: string
          website?: string | null
        }
        Update: {
          accreditation_status?: boolean
          avatar_url?: string | null
          bio?: string
          full_name?: string
          id?: string
          long_description?: Json | null
          regranter_status?: boolean
          type?: Database["public"]["Enums"]["profile_type"]
          username?: string
          website?: string | null
        }
      }
      project_transfers: {
        Row: {
          created_at: string
          grant_amount: number | null
          id: string
          project_id: string
          to_email: string
          transferred: boolean
        }
        Insert: {
          created_at?: string
          grant_amount?: number | null
          id?: string
          project_id: string
          to_email: string
          transferred?: boolean
        }
        Update: {
          created_at?: string
          grant_amount?: number | null
          id?: string
          project_id?: string
          to_email?: string
          transferred?: boolean
        }
      }
      projects: {
        Row: {
          auction_close: string | null
          blurb: string | null
          created_at: string
          creator: string
          description: Json | null
          founder_portion: number
          funding_goal: number
          id: string
          min_funding: number
          round: string
          slug: string
          stage: string
          title: string
          type: Database["public"]["Enums"]["project_type"]
        }
        Insert: {
          auction_close?: string | null
          blurb?: string | null
          created_at?: string
          creator: string
          description?: Json | null
          founder_portion: number
          funding_goal?: number
          id?: string
          min_funding: number
          round: string
          slug?: string
          stage?: string
          title?: string
          type?: Database["public"]["Enums"]["project_type"]
        }
        Update: {
          auction_close?: string | null
          blurb?: string | null
          created_at?: string
          creator?: string
          description?: Json | null
          founder_portion?: number
          funding_goal?: number
          id?: string
          min_funding?: number
          round?: string
          slug?: string
          stage?: string
          title?: string
          type?: Database["public"]["Enums"]["project_type"]
        }
      }
      rounds: {
        Row: {
          auction_close_date: string | null
          description: Json | null
          eval_date: string | null
          header_image_url: string | null
          proposal_due_date: string | null
          retro_pool: number | null
          slug: string
          subtitle: string | null
          title: string
        }
        Insert: {
          auction_close_date?: string | null
          description?: Json | null
          eval_date?: string | null
          header_image_url?: string | null
          proposal_due_date?: string | null
          retro_pool?: number | null
          slug: string
          subtitle?: string | null
          title: string
        }
        Update: {
          auction_close_date?: string | null
          description?: Json | null
          eval_date?: string | null
          header_image_url?: string | null
          proposal_due_date?: string | null
          retro_pool?: number | null
          slug?: string
          subtitle?: string | null
          title?: string
        }
      }
      stripe_txns: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          id: string
          session_id: string
          txn_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          id?: string
          session_id: string
          txn_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          id?: string
          session_id?: string
          txn_id?: string
        }
      }
      txns: {
        Row: {
          amount: number
          bundle: string | null
          created_at: string
          from_id: string | null
          id: string
          project: string | null
          to_id: string
          token: string
        }
        Insert: {
          amount: number
          bundle?: string | null
          created_at?: string
          from_id?: string | null
          id?: string
          project?: string | null
          to_id: string
          token: string
        }
        Update: {
          amount?: number
          bundle?: string | null
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
      get_user_balances: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          username: string
          balance: number
        }[]
      }
      transfer_project: {
        Args: {
          project_id: string
          to_id: string
          from_id: string
          transfer_id: string
          amount: number
        }
        Returns: undefined
      }
    }
    Enums: {
      bid_status: "deleted" | "pending" | "accepted" | "declined"
      bid_type: "buy" | "sell" | "donate"
      profile_type: "individual" | "org"
      project_type: "grant" | "cert"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
