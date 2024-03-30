export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        Relationships: [
          {
            foreignKeyName: "bids_bidder_fkey"
            columns: ["bidder"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_project_fkey"
            columns: ["project"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      causes: {
        Row: {
          cert_params: Json | null
          description: Json | null
          fund_id: string | null
          header_image_url: string
          open: boolean
          prize: boolean
          project_description_outline: string | null
          slug: string
          sort: number
          subtitle: string | null
          title: string
        }
        Insert: {
          cert_params?: Json | null
          description?: Json | null
          fund_id?: string | null
          header_image_url: string
          open?: boolean
          prize?: boolean
          project_description_outline?: string | null
          slug: string
          sort?: number
          subtitle?: string | null
          title: string
        }
        Update: {
          cert_params?: Json | null
          description?: Json | null
          fund_id?: string | null
          header_image_url?: string
          open?: boolean
          prize?: boolean
          project_description_outline?: string | null
          slug?: string
          sort?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "causes_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_rxns: {
        Row: {
          comment_id: string
          reaction: string
          reactor_id: string
          txn_id: string | null
        }
        Insert: {
          comment_id: string
          reaction: string
          reactor_id: string
          txn_id?: string | null
        }
        Update: {
          comment_id?: string
          reaction?: string
          reactor_id?: string
          txn_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_rxns_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_rxns_reactor_id_fkey"
            columns: ["reactor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_rxns_txn_id_fkey"
            columns: ["txn_id"]
            isOneToOne: false
            referencedRelation: "txns"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          commenter: string
          content: Json | null
          created_at: string
          id: string
          project: string
          replying_to: string | null
          special_type: Database["public"]["Enums"]["comment_type"] | null
        }
        Insert: {
          commenter: string
          content?: Json | null
          created_at?: string
          id?: string
          project: string
          replying_to?: string | null
          special_type?: Database["public"]["Enums"]["comment_type"] | null
        }
        Update: {
          commenter?: string
          content?: Json | null
          created_at?: string
          id?: string
          project?: string
          replying_to?: string | null
          special_type?: Database["public"]["Enums"]["comment_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_commenter_fkey"
            columns: ["commenter"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_fkey"
            columns: ["project"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_replying_to_fkey"
            columns: ["replying_to"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      grant_agreements: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          lobbying_clause_excluded: boolean
          project_description: Json | null
          project_id: string
          project_title: string | null
          recipient_name: string | null
          signatory_name: string | null
          signed_at: string | null
          signed_off_site: boolean
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          lobbying_clause_excluded?: boolean
          project_description?: Json | null
          project_id: string
          project_title?: string | null
          recipient_name?: string | null
          signatory_name?: string | null
          signed_at?: string | null
          signed_off_site?: boolean
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          lobbying_clause_excluded?: boolean
          project_description?: Json | null
          project_id?: string
          project_title?: string | null
          recipient_name?: string | null
          signatory_name?: string | null
          signed_at?: string | null
          signed_off_site?: boolean
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grant_agreements_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grant_agreements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_trust: {
        Row: {
          created_at: string
          trusted_id: string
          truster_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          trusted_id: string
          truster_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          trusted_id?: string
          truster_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_trust_trusted_id_fkey"
            columns: ["trusted_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_trust_truster_id_fkey"
            columns: ["truster_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      project_causes: {
        Row: {
          cause_slug: string
          project_id: string
        }
        Insert: {
          cause_slug: string
          project_id: string
        }
        Update: {
          cause_slug?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_causes_cause_slug_fkey"
            columns: ["cause_slug"]
            isOneToOne: false
            referencedRelation: "causes"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "project_causes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_evals: {
        Row: {
          confidence: number
          created_at: string
          evaluator_id: string
          id: string
          project_id: string
          score: number
        }
        Insert: {
          confidence?: number
          created_at?: string
          evaluator_id: string
          id?: string
          project_id: string
          score?: number
        }
        Update: {
          confidence?: number
          created_at?: string
          evaluator_id?: string
          id?: string
          project_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_evals_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_evals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_follows: {
        Row: {
          follower_id: string
          project_id: string
        }
        Insert: {
          follower_id?: string
          project_id: string
        }
        Update: {
          follower_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_follows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_transfers: {
        Row: {
          created_at: string
          id: string
          project_id: string
          recipient_email: string
          recipient_name: string
          transferred: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          recipient_email: string
          recipient_name?: string
          transferred?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          recipient_email?: string
          recipient_name?: string
          transferred?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "project_transfers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_votes: {
        Row: {
          id: number
          magnitude: number
          project_id: string
          voter_id: string
        }
        Insert: {
          id?: number
          magnitude?: number
          project_id: string
          voter_id: string
        }
        Update: {
          id?: number
          magnitude?: number
          project_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_votes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          amm_shares: number | null
          approved: boolean | null
          auction_close: string | null
          blurb: string | null
          created_at: string
          creator: string
          description: Json | null
          external_link: string | null
          founder_shares: number
          funding_goal: number
          id: string
          lobbying: boolean
          location_description: string | null
          markets: Json | null
          min_funding: number
          public_benefit: string | null
          round: string
          signed_agreement: boolean
          slug: string
          stage: Database["public"]["Enums"]["project_stage"]
          title: string
          type: Database["public"]["Enums"]["project_type"]
        }
        Insert: {
          amm_shares?: number | null
          approved?: boolean | null
          auction_close?: string | null
          blurb?: string | null
          created_at?: string
          creator: string
          description?: Json | null
          external_link?: string | null
          founder_shares: number
          funding_goal?: number
          id?: string
          lobbying?: boolean
          location_description?: string | null
          markets?: Json | null
          min_funding: number
          public_benefit?: string | null
          round: string
          signed_agreement?: boolean
          slug?: string
          stage?: Database["public"]["Enums"]["project_stage"]
          title?: string
          type?: Database["public"]["Enums"]["project_type"]
        }
        Update: {
          amm_shares?: number | null
          approved?: boolean | null
          auction_close?: string | null
          blurb?: string | null
          created_at?: string
          creator?: string
          description?: Json | null
          external_link?: string | null
          founder_shares?: number
          funding_goal?: number
          id?: string
          lobbying?: boolean
          location_description?: string | null
          markets?: Json | null
          min_funding?: number
          public_benefit?: string | null
          round?: string
          signed_agreement?: boolean
          slug?: string
          stage?: Database["public"]["Enums"]["project_stage"]
          title?: string
          type?: Database["public"]["Enums"]["project_type"]
        }
        Relationships: [
          {
            foreignKeyName: "projects_creator_fkey"
            columns: ["creator"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_round_fkey"
            columns: ["round"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["title"]
          },
        ]
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "stripe_txns_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_txns_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_txns_txn_id_fkey"
            columns: ["txn_id"]
            isOneToOne: false
            referencedRelation: "txns"
            referencedColumns: ["id"]
          },
        ]
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
          type: Database["public"]["Enums"]["txn_type"] | null
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
          type?: Database["public"]["Enums"]["txn_type"] | null
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
          type?: Database["public"]["Enums"]["txn_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "txns_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "txns_project_fkey"
            columns: ["project"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "txns_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
    }
    Functions: {
      _transfer_project:
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
              txn_id: string
              donor_comment_id?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              project_id: string
              to_id: string
              transfer_id: string
            }
            Returns: undefined
          }
      activate_cert: {
        Args: {
          project_id: string
          project_creator: string
        }
        Returns: undefined
      }
      activate_grant: {
        Args: {
          project_id: string
          project_creator: string
        }
        Returns: undefined
      }
      add_tags: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      add_topics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_transfer_grant: {
        Args: {
          project: Database["public"]["CompositeTypes"]["project_row"]
          donor_comment: Database["public"]["CompositeTypes"]["comment_row"]
          project_transfer: Database["public"]["CompositeTypes"]["transfer_row"]
          grant_amount: number
        }
        Returns: undefined
      }
      execute_grant_verdict:
        | {
            Args: {
              approved: boolean
              project_id: string
              project_creator: string
              admin_id?: string
              admin_comment_content?: Json
            }
            Returns: undefined
          }
        | {
            Args: {
              approved: boolean
              project_id: string
              project_creator: string
              admin_id?: string
              admin_comment_content?: Json
              public_benefit?: string
            }
            Returns: undefined
          }
      follow_project: {
        Args: {
          project_id: string
          follower_id: string
        }
        Returns: undefined
      }
      get_user_balances: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          username: string
          balance: number
        }[]
      }
      give_grant: {
        Args: {
          project: Database["public"]["CompositeTypes"]["project_row"]
          donor_comment: Database["public"]["CompositeTypes"]["comment_row"]
          donation: Database["public"]["CompositeTypes"]["bid_row"]
        }
        Returns: undefined
      }
      reject_grant: {
        Args: {
          project_id: string
        }
        Returns: undefined
      }
      reject_proposal: {
        Args: {
          project_id: string
        }
        Returns: undefined
      }
      toggle_follow: {
        Args: {
          project_id: string
          follower_id: string
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
              donor_comment_id: string
              txn_id?: string
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
      unfollow_project: {
        Args: {
          project_id: string
          follower_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      bid_status: "deleted" | "pending" | "accepted" | "declined"
      bid_type: "buy" | "sell" | "donate" | "assurance buy" | "assurance sell"
      comment_type: "progress update" | "final report"
      profile_type: "individual" | "org" | "fund" | "amm"
      project_stage:
        | "active"
        | "proposal"
        | "not funded"
        | "complete"
        | "hidden"
        | "draft"
      project_type: "grant" | "cert" | "dummy"
      txn_type:
        | "profile donation"
        | "project donation"
        | "user to user trade"
        | "user to amm trade"
        | "withdraw"
        | "deposit"
        | "cash to charity transfer"
        | "inject amm liquidity"
        | "mint cert"
        | "mana deposit"
        | "tip"
    }
    CompositeTypes: {
      bid_row: {
        project: string | null
        amount: number | null
        bidder: string | null
      }
      comment_row: {
        id: string | null
        project: string | null
        commenter: string | null
        content: Json | null
      }
      comment_row_txnless: {
        id: string | null
        project: string | null
        commenter: string | null
        content: Json | null
      }
      project_row: {
        id: string | null
        creator: string | null
        title: string | null
        blurb: string | null
        description: Json | null
        min_funding: number | null
        funding_goal: number | null
        founder_shares: number | null
        type: Database["public"]["Enums"]["project_type"] | null
        stage: Database["public"]["Enums"]["project_stage"] | null
        round: string | null
        slug: string | null
        location_description: string | null
      }
      transfer_row: {
        recipient_email: string | null
        recipient_name: string | null
        project_id: string | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
