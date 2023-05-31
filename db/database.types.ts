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
          txn_id: string | null
        }
        Insert: {
          commenter: string
          content?: Json | null
          created_at?: string
          id?: string
          project: string
          replying_to?: string | null
          txn_id?: string | null
        }
        Update: {
          commenter?: string
          content?: Json | null
          created_at?: string
          id?: string
          project?: string
          replying_to?: string | null
          txn_id?: string | null
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
          stripe_connect_id: string | null
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
          stripe_connect_id?: string | null
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
          stripe_connect_id?: string | null
          type?: Database["public"]["Enums"]["profile_type"]
          username?: string
          website?: string | null
        }
      }
      project_transfers: {
        Row: {
          created_at: string | null
          donor_comment_id: string | null
          grant_amount: number | null
          id: string
          project_id: string
          to_email: string
          transferred: boolean
        }
        Insert: {
          created_at?: string | null
          donor_comment_id?: string | null
          grant_amount?: number | null
          id?: string
          project_id: string
          to_email: string
          transferred?: boolean
        }
        Update: {
          created_at?: string | null
          donor_comment_id?: string | null
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
          stage: Database["public"]["Enums"]["project_stage"]
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
          stage?: Database["public"]["Enums"]["project_stage"]
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
          stage?: Database["public"]["Enums"]["project_stage"]
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
          id: number
          session_id: string
          txn_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          id?: number
          session_id: string
          txn_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          id?: number
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
      _create_car: {
        Args: {
          car: Database["public"]["CompositeTypes"]["car_type"]
        }
        Returns: undefined
      }
      _create_grant:
        | {
            Args: {
              project: Database["public"]["CompositeTypes"]["project_row"]
              donor_comment: Database["public"]["CompositeTypes"]["comment_row"][]
              donation: Database["public"]["CompositeTypes"]["txn_row"]
            }
            Returns: undefined
          }
        | {
            Args: {
              project: Database["public"]["CompositeTypes"]["project_row"]
              donor_comment: Database["public"]["CompositeTypes"]["comment_row"]
              donation: Database["public"]["CompositeTypes"]["txn_row"]
            }
            Returns: undefined
          }
      _transfer_project: {
        Args: {
          project_id: string
          to_id: string
          from_id: string
          transfer_id: string
          amount: number
          txn_id: string
          donor_comment_id?: string
        }
        Returns: undefined
      }
      approve_grant: {
        Args: {
          new_stage: Database["public"]["Enums"]["project_stage"]
          project_id: string
          project_creator: string
          admin_id: string
          admin_comment_content?: Json
        }
        Returns: undefined
      }
      create_grant:
        | {
            Args: {
              donation: Database["public"]["CompositeTypes"]["txn_row"]
            }
            Returns: undefined
          }
        | {
            Args: {
              project: Database["public"]["CompositeTypes"]["project_row"]
              donor_comment: Database["public"]["CompositeTypes"]["comment_row"][]
              donation: Database["public"]["CompositeTypes"]["txn_row"]
            }
            Returns: undefined
          }
      create_transfer_grant: {
        Args: {
          project: Database["public"]["CompositeTypes"]["project_row"]
          donor_comment: Database["public"]["CompositeTypes"]["comment_row_txnless"]
          project_transfer: Database["public"]["CompositeTypes"]["transfer_row"]
        }
        Returns: undefined
      }
      execute_grant_verdict: {
        Args: {
          new_stage: Database["public"]["Enums"]["project_stage"]
          project_id: string
          project_creator: string
          admin_id: string
          admin_comment_content?: Json
        }
        Returns: undefined
      }
      give_grant: {
        Args: {
          project: Database["public"]["CompositeTypes"]["project_row"]
          donor_comment: Database["public"]["CompositeTypes"]["comment_row"]
          donation: Database["public"]["CompositeTypes"]["txn_row"]
        }
        Returns: undefined
      }
      transfer_project:
        | {
            Args: {
              project_id: string
              to_id: string
              from_id: string
              transfer_id: string
              amount: number
            }
            Returns: undefined
          }
        | {
            Args: {
              project_id: string
              to_id: string
              from_id: string
              transfer_id: string
              amount: number
              donor_notes: Json
            }
            Returns: undefined
          }
        | {
            Args: {
              project_id: string
              to_id: string
              from_id: string
              transfer_id: string
              amount: number
              txn_id: string
              donor_comment_id?: string
            }
            Returns: undefined
          }
    }
    Enums: {
      bid_status: "deleted" | "pending" | "accepted" | "declined"
      bid_type: "buy" | "sell" | "donate"
      profile_type: "individual" | "org"
      project_stage:
        | "active"
        | "proposal"
        | "not funded"
        | "hidden"
        | "pending approval"
        | "complete"
      project_type: "grant" | "cert"
    }
    CompositeTypes: {
      blah: {
        token: string
        boken: string
      }
      car_type: {
        make: string
        year: string
      }
      comment_row: {
        id: string
        project: string
        commenter: string
        content: Json
        txn_id: string
      }
      comment_row_txnless: {
        id: string
        project: string
        commenter: string
        content: Json
      }
      project_row: {
        id: string
        creator: string
        title: string
        blurb: string
        description: Json
        min_funding: number
        funding_goal: number
        founder_portion: number
        type: Database["public"]["Enums"]["project_type"]
        stage: string
        round: string
        slug: string
      }
      transfer_row: {
        to_email: string
        project_id: string
        grant_amount: number
        donor_comment_id: string
      }
      txn_row: {
        id: string
        project: string
        amount: number
        from_id: string
        to_id: string
        token: string
      }
    }
  }
}
