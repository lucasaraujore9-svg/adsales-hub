export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activities: {
        Row: {
          company_id: string | null
          completed: boolean
          completed_at: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          due_date: string | null
          id: string
          outcome: string | null
          title: string
          type: string
          updated_at: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          company_id?: string | null
          completed?: boolean
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          outcome?: string | null
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          company_id?: string | null
          completed?: boolean
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          outcome?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_accounts: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          name: string
          provider: string
          provider_account_id: string
          status: string
          timezone: string
          token_expires_at: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          name: string
          provider?: string
          provider_account_id: string
          status?: string
          timezone?: string
          token_expires_at?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          name?: string
          provider?: string
          provider_account_id?: string
          status?: string
          timezone?: string
          token_expires_at?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_creatives: {
        Row: {
          category: string | null
          created_at: string
          file_url: string | null
          id: string
          name: string
          performance_data: Json | null
          tags: string[] | null
          thumbnail_url: string | null
          type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          name: string
          performance_data?: Json | null
          tags?: string[] | null
          thumbnail_url?: string | null
          type: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          name?: string
          performance_data?: Json | null
          tags?: string[] | null
          thumbnail_url?: string | null
          type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_creatives_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_metrics: {
        Row: {
          ad_id: string
          clicks: number
          cpl: number
          created_at: string
          ctr: number
          date: string
          frequency: number
          hour: number | null
          id: string
          impressions: number
          leads: number
          reach: number
          roas: number
          spend: number
        }
        Insert: {
          ad_id: string
          clicks?: number
          cpl?: number
          created_at?: string
          ctr?: number
          date: string
          frequency?: number
          hour?: number | null
          id?: string
          impressions?: number
          leads?: number
          reach?: number
          roas?: number
          spend?: number
        }
        Update: {
          ad_id?: string
          clicks?: number
          cpl?: number
          created_at?: string
          ctr?: number
          date?: string
          frequency?: number
          hour?: number | null
          id?: string
          impressions?: number
          leads?: number
          reach?: number
          roas?: number
          spend?: number
        }
        Relationships: [
          {
            foreignKeyName: "ad_metrics_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_set_metrics: {
        Row: {
          ad_set_id: string
          clicks: number
          cpl: number
          created_at: string
          ctr: number
          date: string
          frequency: number
          hour: number | null
          id: string
          impressions: number
          leads: number
          reach: number
          roas: number
          spend: number
        }
        Insert: {
          ad_set_id: string
          clicks?: number
          cpl?: number
          created_at?: string
          ctr?: number
          date: string
          frequency?: number
          hour?: number | null
          id?: string
          impressions?: number
          leads?: number
          reach?: number
          roas?: number
          spend?: number
        }
        Update: {
          ad_set_id?: string
          clicks?: number
          cpl?: number
          created_at?: string
          ctr?: number
          date?: string
          frequency?: number
          hour?: number | null
          id?: string
          impressions?: number
          leads?: number
          reach?: number
          roas?: number
          spend?: number
        }
        Relationships: [
          {
            foreignKeyName: "ad_set_metrics_ad_set_id_fkey"
            columns: ["ad_set_id"]
            isOneToOne: false
            referencedRelation: "ad_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_sets: {
        Row: {
          bid_strategy: string | null
          campaign_id: string
          created_at: string
          daily_budget: number | null
          end_date: string | null
          id: string
          name: string
          placements: Json
          provider_ad_set_id: string | null
          schedule: Json | null
          start_date: string | null
          status: string
          targeting: Json
          updated_at: string
          workspace_id: string
        }
        Insert: {
          bid_strategy?: string | null
          campaign_id: string
          created_at?: string
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          name: string
          placements?: Json
          provider_ad_set_id?: string | null
          schedule?: Json | null
          start_date?: string | null
          status?: string
          targeting?: Json
          updated_at?: string
          workspace_id: string
        }
        Update: {
          bid_strategy?: string | null
          campaign_id?: string
          created_at?: string
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          name?: string
          placements?: Json
          provider_ad_set_id?: string | null
          schedule?: Json | null
          start_date?: string | null
          status?: string
          targeting?: Json
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_sets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_sets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          ad_set_id: string
          created_at: string
          creative_id: string | null
          cta: string | null
          description: string | null
          headline: string | null
          id: string
          image_url: string | null
          link_url: string | null
          name: string
          primary_text: string | null
          provider_ad_id: string | null
          status: string
          updated_at: string
          video_url: string | null
          workspace_id: string
        }
        Insert: {
          ad_set_id: string
          created_at?: string
          creative_id?: string | null
          cta?: string | null
          description?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          name: string
          primary_text?: string | null
          provider_ad_id?: string | null
          status?: string
          updated_at?: string
          video_url?: string | null
          workspace_id: string
        }
        Update: {
          ad_set_id?: string
          created_at?: string
          creative_id?: string | null
          cta?: string | null
          description?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          name?: string
          primary_text?: string | null
          provider_ad_id?: string | null
          status?: string
          updated_at?: string
          video_url?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_ad_set_id_fkey"
            columns: ["ad_set_id"]
            isOneToOne: false
            referencedRelation: "ad_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "ad_creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
          tokens_used: number | null
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
          tokens_used?: number | null
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          tokens_used?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_threads: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          message_count: number
          title: string
          updated_at: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          message_count?: number
          title?: string
          updated_at?: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          message_count?: number
          title?: string
          updated_at?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_threads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_creative_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          preview_url: string | null
          template_data: Json
          type: string
          workspace_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          preview_url?: string | null
          template_data?: Json
          type: string
          workspace_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          preview_url?: string | null
          template_data?: Json
          type?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_creative_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_creatives: {
        Row: {
          briefing: string | null
          campaign_id: string | null
          cost_cents: number | null
          created_at: string
          created_by_user_id: string | null
          dimensions: Json | null
          duration_seconds: number | null
          file_url: string | null
          format: string | null
          id: string
          metadata: Json | null
          prompt: string
          provider: string
          social_post_id: string | null
          status: string
          template_id: string | null
          thumbnail_url: string | null
          type: string
          workspace_id: string
        }
        Insert: {
          briefing?: string | null
          campaign_id?: string | null
          cost_cents?: number | null
          created_at?: string
          created_by_user_id?: string | null
          dimensions?: Json | null
          duration_seconds?: number | null
          file_url?: string | null
          format?: string | null
          id?: string
          metadata?: Json | null
          prompt: string
          provider: string
          social_post_id?: string | null
          status?: string
          template_id?: string | null
          thumbnail_url?: string | null
          type: string
          workspace_id: string
        }
        Update: {
          briefing?: string | null
          campaign_id?: string | null
          cost_cents?: number | null
          created_at?: string
          created_by_user_id?: string | null
          dimensions?: Json | null
          duration_seconds?: number | null
          file_url?: string | null
          format?: string | null
          id?: string
          metadata?: Json | null
          prompt?: string
          provider?: string
          social_post_id?: string | null
          status?: string
          template_id?: string | null
          thumbnail_url?: string | null
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_creatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_creatives_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_creatives_social_post_id_fkey"
            columns: ["social_post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_creatives_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "ai_creative_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_creatives_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          action_applied: boolean
          action_type: string | null
          applied_at: string | null
          area: string
          campaign_id: string | null
          created_at: string
          description: string
          details: Json | null
          id: string
          optimization_log_id: string | null
          severity: string
          suggested_action: string | null
          title: string
          type: string
          valid_until: string | null
          workspace_id: string
        }
        Insert: {
          action_applied?: boolean
          action_type?: string | null
          applied_at?: string | null
          area: string
          campaign_id?: string | null
          created_at?: string
          description: string
          details?: Json | null
          id?: string
          optimization_log_id?: string | null
          severity?: string
          suggested_action?: string | null
          title: string
          type: string
          valid_until?: string | null
          workspace_id: string
        }
        Update: {
          action_applied?: boolean
          action_type?: string | null
          applied_at?: string | null
          area?: string
          campaign_id?: string | null
          created_at?: string
          description?: string
          details?: Json | null
          id?: string
          optimization_log_id?: string | null
          severity?: string
          suggested_action?: string | null
          title?: string
          type?: string
          valid_until?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_optimization_log_id_fkey"
            columns: ["optimization_log_id"]
            isOneToOne: false
            referencedRelation: "ai_optimization_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_optimization_logs: {
        Row: {
          action: string
          applied_at: string | null
          campaign_id: string | null
          created_at: string
          details: Json
          id: string
          status: string
          type: string
          workspace_id: string
        }
        Insert: {
          action: string
          applied_at?: string | null
          campaign_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          status?: string
          type: string
          workspace_id: string
        }
        Update: {
          action?: string
          applied_at?: string | null
          campaign_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          status?: string
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_optimization_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_optimization_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_questions: {
        Row: {
          answer: string | null
          charts: Json | null
          created_at: string
          data_consulted: Json | null
          id: string
          question: string
          tokens_used: number | null
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          answer?: string | null
          charts?: Json | null
          created_at?: string
          data_consulted?: Json | null
          id?: string
          question: string
          tokens_used?: number | null
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          answer?: string | null
          charts?: Json | null
          created_at?: string
          data_consulted?: Json | null
          id?: string
          question?: string
          tokens_used?: number | null
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_questions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          scopes: Json
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          scopes?: Json
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          scopes?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audience_syncs: {
        Row: {
          audience_id: string
          created_at: string
          direction: string
          error: string | null
          id: string
          last_run_at: string | null
          records_synced: number
          status: string
          workspace_id: string
        }
        Insert: {
          audience_id: string
          created_at?: string
          direction: string
          error?: string | null
          id?: string
          last_run_at?: string | null
          records_synced?: number
          status?: string
          workspace_id: string
        }
        Update: {
          audience_id?: string
          created_at?: string
          direction?: string
          error?: string | null
          id?: string
          last_run_at?: string | null
          records_synced?: number
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audience_syncs_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audience_syncs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audiences: {
        Row: {
          config: Json
          created_at: string
          id: string
          last_synced_at: string | null
          name: string
          provider_audience_id: string | null
          size_estimate: number | null
          type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          last_synced_at?: string | null
          name: string
          provider_audience_id?: string | null
          size_estimate?: number | null
          type: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          last_synced_at?: string | null
          name?: string
          provider_audience_id?: string | null
          size_estimate?: number | null
          type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audiences_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_actions: {
        Row: {
          action_type: string
          automation_id: string
          config: Json
          created_at: string
          id: string
          position: number
        }
        Insert: {
          action_type: string
          automation_id: string
          config?: Json
          created_at?: string
          id?: string
          position: number
        }
        Update: {
          action_type?: string
          automation_id?: string
          config?: Json
          created_at?: string
          id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "automation_actions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          automation_id: string
          details: Json | null
          error: string | null
          executed_at: string
          id: string
          status: string
          trigger_entity_id: string | null
          trigger_entity_type: string | null
          workspace_id: string
        }
        Insert: {
          automation_id: string
          details?: Json | null
          error?: string | null
          executed_at?: string
          id?: string
          status: string
          trigger_entity_id?: string | null
          trigger_entity_type?: string | null
          workspace_id: string
        }
        Update: {
          automation_id?: string
          details?: Json | null
          error?: string | null
          executed_at?: string
          id?: string
          status?: string
          trigger_entity_id?: string | null
          trigger_entity_type?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          conditions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          last_run_at: string | null
          name: string
          run_count: number
          trigger_config: Json
          trigger_type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name: string
          run_count?: number
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name?: string
          run_count?: number
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      basket_modules: {
        Row: {
          basket_id: string
          created_at: string
          module_id: string
        }
        Insert: {
          basket_id: string
          created_at?: string
          module_id: string
        }
        Update: {
          basket_id?: string
          created_at?: string
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "basket_modules_basket_id_fkey"
            columns: ["basket_id"]
            isOneToOne: false
            referencedRelation: "baskets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "basket_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      baskets: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          is_featured: boolean
          max_media_monthly: number
          max_users: number | null
          module_ids: Json
          name: string
          price_monthly: number
          trial_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          max_media_monthly?: number
          max_users?: number | null
          module_ids?: Json
          name: string
          price_monthly: number
          trial_days?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          max_media_monthly?: number
          max_users?: number | null
          module_ids?: Json
          name?: string
          price_monthly?: number
          trial_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      call_analyses: {
        Row: {
          call_id: string
          created_at: string
          id: string
          model: string | null
          objections: Json | null
          opportunities: Json | null
          pdf_url: string | null
          score: number | null
          sentiment: string | null
          strengths: Json | null
          summary: string | null
          workspace_id: string
        }
        Insert: {
          call_id: string
          created_at?: string
          id?: string
          model?: string | null
          objections?: Json | null
          opportunities?: Json | null
          pdf_url?: string | null
          score?: number | null
          sentiment?: string | null
          strengths?: Json | null
          summary?: string | null
          workspace_id: string
        }
        Update: {
          call_id?: string
          created_at?: string
          id?: string
          model?: string | null
          objections?: Json | null
          opportunities?: Json | null
          pdf_url?: string | null
          score?: number | null
          sentiment?: string | null
          strengths?: Json | null
          summary?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_analyses_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_analyses_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      call_scripts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          variables: Json | null
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          variables?: Json | null
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          variables?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_scripts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          contact_id: string | null
          created_at: string
          deal_id: string | null
          direction: string
          duration_seconds: number
          ended_at: string | null
          id: string
          phone_number: string | null
          provider: string | null
          provider_call_id: string | null
          recording_url: string | null
          started_at: string | null
          status: string
          transcript: string | null
          updated_at: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          direction?: string
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          phone_number?: string | null
          provider?: string | null
          provider_call_id?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: string
          transcript?: string | null
          updated_at?: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          direction?: string
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          phone_number?: string | null
          provider?: string | null
          provider_call_id?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: string
          transcript?: string | null
          updated_at?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_metrics: {
        Row: {
          campaign_id: string
          clicks: number
          cpl: number
          created_at: string
          ctr: number
          date: string
          frequency: number
          hour: number | null
          id: string
          impressions: number
          leads: number
          quality_score: number | null
          reach: number
          roas: number
          spend: number
        }
        Insert: {
          campaign_id: string
          clicks?: number
          cpl?: number
          created_at?: string
          ctr?: number
          date: string
          frequency?: number
          hour?: number | null
          id?: string
          impressions?: number
          leads?: number
          quality_score?: number | null
          reach?: number
          roas?: number
          spend?: number
        }
        Update: {
          campaign_id?: string
          clicks?: number
          cpl?: number
          created_at?: string
          ctr?: number
          date?: string
          frequency?: number
          hour?: number | null
          id?: string
          impressions?: number
          leads?: number
          quality_score?: number | null
          reach?: number
          roas?: number
          spend?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ad_account_id: string
          ai_briefing: string | null
          ai_generated_config: Json | null
          created_at: string
          daily_budget: number | null
          end_date: string | null
          id: string
          lifetime_budget: number | null
          name: string
          objective: string
          provider_campaign_id: string | null
          start_date: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          ad_account_id: string
          ai_briefing?: string | null
          ai_generated_config?: Json | null
          created_at?: string
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          lifetime_budget?: number | null
          name: string
          objective: string
          provider_campaign_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          ad_account_id?: string
          ai_briefing?: string | null
          ai_generated_config?: Json | null
          created_at?: string
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          lifetime_budget?: number | null
          name?: string
          objective?: string
          provider_campaign_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: Json | null
          annual_revenue: number | null
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          name: string
          notes: string | null
          phone: string | null
          size: string | null
          updated_at: string
          website: string | null
          workspace_id: string
        }
        Insert: {
          address?: Json | null
          annual_revenue?: number | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          size?: string | null
          updated_at?: string
          website?: string | null
          workspace_id: string
        }
        Update: {
          address?: Json | null
          annual_revenue?: number | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          size?: string | null
          updated_at?: string
          website?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          last_contacted_at: string | null
          lifecycle_stage: string | null
          name: string
          notes: string | null
          owner_user_id: string | null
          phone: string | null
          position: string | null
          source: string | null
          source_details: Json | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          whatsapp: string | null
          workspace_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          lifecycle_stage?: string | null
          name: string
          notes?: string | null
          owner_user_id?: string | null
          phone?: string | null
          position?: string | null
          source?: string | null
          source_details?: Json | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp?: string | null
          workspace_id: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          lifecycle_stage?: string | null
          name?: string
          notes?: string | null
          owner_user_id?: string | null
          phone?: string | null
          position?: string | null
          source?: string | null
          source_details?: Json | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_signatories: {
        Row: {
          auth_method: string | null
          certificate_url: string | null
          contract_id: string
          created_at: string
          email: string
          geolocation: Json | null
          id: string
          ip_address: unknown
          name: string
          phone: string | null
          role: string
          sign_order: number
          signature_data: string | null
          signature_type: string | null
          signed_at: string | null
          status: string
          workspace_id: string
        }
        Insert: {
          auth_method?: string | null
          certificate_url?: string | null
          contract_id: string
          created_at?: string
          email: string
          geolocation?: Json | null
          id?: string
          ip_address?: unknown
          name: string
          phone?: string | null
          role?: string
          sign_order?: number
          signature_data?: string | null
          signature_type?: string | null
          signed_at?: string | null
          status?: string
          workspace_id: string
        }
        Update: {
          auth_method?: string | null
          certificate_url?: string | null
          contract_id?: string
          created_at?: string
          email?: string
          geolocation?: Json | null
          id?: string
          ip_address?: unknown
          name?: string
          phone?: string | null
          role?: string
          sign_order?: number
          signature_data?: string | null
          signature_type?: string | null
          signed_at?: string | null
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_signatories_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_signatories_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          content: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          variables: Json
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          variables?: Json
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          variables?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          content: string
          created_at: string
          deal_id: string | null
          expires_at: string | null
          id: string
          proposal_id: string | null
          signed_at: string | null
          signed_document_url: string | null
          status: string
          template_id: string | null
          title: string
          updated_at: string
          variables: Json
          verification_hash: string | null
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deal_id?: string | null
          expires_at?: string | null
          id?: string
          proposal_id?: string | null
          signed_at?: string | null
          signed_document_url?: string | null
          status?: string
          template_id?: string | null
          title: string
          updated_at?: string
          variables?: Json
          verification_hash?: string | null
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deal_id?: string | null
          expires_at?: string | null
          id?: string
          proposal_id?: string | null
          signed_at?: string | null
          signed_document_url?: string | null
          status?: string
          template_id?: string | null
          title?: string
          updated_at?: string
          variables?: Json
          verification_hash?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          direction: string
          error: string | null
          id: string
          media_urls: Json | null
          provider_message_id: string | null
          replied_to_id: string | null
          sender_name: string | null
          sender_user_id: string | null
          status: string
          workspace_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          direction: string
          error?: string | null
          id?: string
          media_urls?: Json | null
          provider_message_id?: string | null
          replied_to_id?: string | null
          sender_name?: string | null
          sender_user_id?: string | null
          status?: string
          workspace_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          direction?: string
          error?: string | null
          id?: string
          media_urls?: Json | null
          provider_message_id?: string | null
          replied_to_id?: string | null
          sender_name?: string | null
          sender_user_id?: string | null
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_replied_to_id_fkey"
            columns: ["replied_to_id"]
            isOneToOne: false
            referencedRelation: "conversation_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assignee_user_id: string | null
          channel: string
          channel_identifier: string
          contact_id: string | null
          created_at: string
          deal_id: string | null
          external_conversation_id: string | null
          id: string
          last_inbound_at: string | null
          last_message_at: string
          last_message_preview: string | null
          metadata: Json
          priority: string
          status: string
          tags: string[] | null
          team: string | null
          unread_count: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assignee_user_id?: string | null
          channel: string
          channel_identifier: string
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          external_conversation_id?: string | null
          id?: string
          last_inbound_at?: string | null
          last_message_at?: string
          last_message_preview?: string | null
          metadata?: Json
          priority?: string
          status?: string
          tags?: string[] | null
          team?: string | null
          unread_count?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assignee_user_id?: string | null
          channel?: string
          channel_identifier?: string
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          external_conversation_id?: string | null
          id?: string
          last_inbound_at?: string | null
          last_message_at?: string
          last_message_preview?: string | null
          metadata?: Json
          priority?: string
          status?: string
          tags?: string[] | null
          team?: string | null
          unread_count?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assignee_user_id_fkey"
            columns: ["assignee_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_values: {
        Row: {
          created_at: string
          custom_field_id: string
          entity_id: string
          id: string
          updated_at: string
          value: Json | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          custom_field_id: string
          entity_id: string
          id?: string
          updated_at?: string
          value?: Json | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          custom_field_id?: string
          entity_id?: string
          id?: string
          updated_at?: string
          value?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_custom_field_id_fkey"
            columns: ["custom_field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_values_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          created_at: string
          entity: string
          field_key: string
          id: string
          name: string
          options: Json | null
          position: number
          required: boolean
          type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          entity: string
          field_key: string
          id?: string
          name: string
          options?: Json | null
          position?: number
          required?: boolean
          type: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          entity?: string
          field_key?: string
          id?: string
          name?: string
          options?: Json | null
          position?: number
          required?: boolean
          type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_fields_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_tags: {
        Row: {
          deal_id: string
          tag_id: string
        }
        Insert: {
          deal_id: string
          tag_id: string
        }
        Update: {
          deal_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_tags_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          closed_at: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          currency: string
          expected_close_date: string | null
          id: string
          loss_reason_id: string | null
          loss_reason_notes: string | null
          owner_user_id: string | null
          pipeline_id: string
          position: number
          source: string | null
          stage_entered_at: string
          stage_id: string
          status: string
          title: string
          updated_at: string
          value: number
          workspace_id: string
        }
        Insert: {
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string
          expected_close_date?: string | null
          id?: string
          loss_reason_id?: string | null
          loss_reason_notes?: string | null
          owner_user_id?: string | null
          pipeline_id: string
          position?: number
          source?: string | null
          stage_entered_at?: string
          stage_id: string
          status?: string
          title: string
          updated_at?: string
          value?: number
          workspace_id: string
        }
        Update: {
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string
          expected_close_date?: string | null
          id?: string
          loss_reason_id?: string | null
          loss_reason_notes?: string | null
          owner_user_id?: string | null
          pipeline_id?: string
          position?: number
          source?: string | null
          stage_entered_at?: string
          stage_id?: string
          status?: string
          title?: string
          updated_at?: string
          value?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_loss_reason_id_fkey"
            columns: ["loss_reason_id"]
            isOneToOne: false
            referencedRelation: "loss_reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaign_metrics: {
        Row: {
          bounced: number
          click_rate: number
          clicked: number
          complained: number
          delivered: number
          email_campaign_id: string
          id: string
          open_rate: number
          opened: number
          sent: number
          unsubscribed: number
          updated_at: string
        }
        Insert: {
          bounced?: number
          click_rate?: number
          clicked?: number
          complained?: number
          delivered?: number
          email_campaign_id: string
          id?: string
          open_rate?: number
          opened?: number
          sent?: number
          unsubscribed?: number
          updated_at?: string
        }
        Update: {
          bounced?: number
          click_rate?: number
          clicked?: number
          complained?: number
          delivered?: number
          email_campaign_id?: string
          id?: string
          open_rate?: number
          opened?: number
          sent?: number
          unsubscribed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_metrics_email_campaign_id_fkey"
            columns: ["email_campaign_id"]
            isOneToOne: true
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          content: string
          created_at: string
          from_email: string
          from_name: string
          id: string
          name: string
          preview_text: string | null
          reply_to: string | null
          scheduled_at: string | null
          segment_config: Json
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          from_email: string
          from_name: string
          id?: string
          name: string
          preview_text?: string | null
          reply_to?: string | null
          scheduled_at?: string | null
          segment_config?: Json
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          from_email?: string
          from_name?: string
          id?: string
          name?: string
          preview_text?: string | null
          reply_to?: string | null
          scheduled_at?: string | null
          segment_config?: Json
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          subject: string
          updated_at: string
          variables: Json | null
          workspace_id: string
        }
        Insert: {
          body_html: string
          body_text?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          subject: string
          updated_at?: string
          variables?: Json | null
          workspace_id: string
        }
        Update: {
          body_html?: string
          body_text?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          updated_at?: string
          variables?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          contact_id: string | null
          created_at: string
          data: Json
          deal_id: string | null
          form_id: string | null
          id: string
          ip_address: unknown
          landing_page_id: string | null
          referrer: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          workspace_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          data?: Json
          deal_id?: string | null
          form_id?: string | null
          id?: string
          ip_address?: unknown
          landing_page_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          workspace_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          data?: Json
          deal_id?: string | null
          form_id?: string | null
          id?: string
          ip_address?: unknown
          landing_page_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string
          fields: Json
          id: string
          is_active: boolean
          name: string
          redirect_url: string | null
          settings: Json
          slug: string
          thank_you_message: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          fields?: Json
          id?: string
          is_active?: boolean
          name: string
          redirect_url?: string | null
          settings?: Json
          slug: string
          thank_you_message?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          fields?: Json
          id?: string
          is_active?: boolean
          name?: string
          redirect_url?: string | null
          settings?: Json
          slug?: string
          thank_you_message?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          achieved: number
          created_at: string
          id: string
          metric: string
          owner_user_id: string | null
          period_end: string
          period_start: string
          period_type: string
          scope: string
          target: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          achieved?: number
          created_at?: string
          id?: string
          metric: string
          owner_user_id?: string | null
          period_end: string
          period_start: string
          period_type?: string
          scope?: string
          target: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          achieved?: number
          created_at?: string
          id?: string
          metric?: string
          owner_user_id?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          scope?: string
          target?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          created_at: string
          credentials: Json
          display_name: string | null
          id: string
          last_sync_at: string | null
          provider: string
          settings: Json
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          credentials?: Json
          display_name?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          settings?: Json
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          credentials?: Json
          display_name?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          settings?: Json
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_date: string | null
          hosted_invoice_url: string | null
          id: string
          number: string | null
          paid_at: string | null
          payment_method: string | null
          pdf_url: string | null
          status: string
          stripe_invoice_id: string | null
          subscription_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          due_date?: string | null
          hosted_invoice_url?: string | null
          id?: string
          number?: string | null
          paid_at?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string | null
          hosted_invoice_url?: string | null
          id?: string
          number?: string | null
          paid_at?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_versions: {
        Row: {
          content: Json
          conversion_rate: number
          conversions: number
          created_at: string
          id: string
          is_winner: boolean
          landing_page_id: string
          traffic_split: number
          version_name: string
          visits: number
          workspace_id: string
        }
        Insert: {
          content?: Json
          conversion_rate?: number
          conversions?: number
          created_at?: string
          id?: string
          is_winner?: boolean
          landing_page_id: string
          traffic_split?: number
          version_name: string
          visits?: number
          workspace_id: string
        }
        Update: {
          content?: Json
          conversion_rate?: number
          conversions?: number
          created_at?: string
          id?: string
          is_winner?: boolean
          landing_page_id?: string
          traffic_split?: number
          version_name?: string
          visits?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_versions_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_versions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          content: Json
          created_at: string
          domain: string | null
          id: string
          meta_pixel_id: string | null
          name: string
          published: boolean
          published_at: string | null
          seo: Json | null
          slug: string
          template_id: string | null
          updated_at: string
          utm_config: Json | null
          workspace_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          domain?: string | null
          id?: string
          meta_pixel_id?: string | null
          name: string
          published?: boolean
          published_at?: string | null
          seo?: Json | null
          slug: string
          template_id?: string | null
          updated_at?: string
          utm_config?: Json | null
          workspace_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          domain?: string | null
          id?: string
          meta_pixel_id?: string | null
          name?: string
          published?: boolean
          published_at?: string | null
          seo?: Json | null
          slug?: string
          template_id?: string | null
          updated_at?: string
          utm_config?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_forms: {
        Row: {
          campaign_id: string | null
          created_at: string
          description: string | null
          fields: Json
          headline: string | null
          id: string
          is_active: boolean
          name: string
          provider_form_id: string | null
          redirect_url: string | null
          thank_you_message: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          description?: string | null
          fields?: Json
          headline?: string | null
          id?: string
          is_active?: boolean
          name: string
          provider_form_id?: string | null
          redirect_url?: string | null
          thank_you_message?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          description?: string | null
          fields?: Json
          headline?: string | null
          id?: string
          is_active?: boolean
          name?: string
          provider_form_id?: string | null
          redirect_url?: string | null
          thank_you_message?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_forms_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_forms_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          ad_id: string | null
          ad_set_id: string | null
          campaign_id: string | null
          captured_at: string | null
          contact_id: string | null
          cost: number | null
          created_at: string
          deal_id: string | null
          form_id: string | null
          id: string
          lead_form_id: string | null
          source_type: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          workspace_id: string
        }
        Insert: {
          ad_id?: string | null
          ad_set_id?: string | null
          campaign_id?: string | null
          captured_at?: string | null
          contact_id?: string | null
          cost?: number | null
          created_at?: string
          deal_id?: string | null
          form_id?: string | null
          id?: string
          lead_form_id?: string | null
          source_type: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          workspace_id: string
        }
        Update: {
          ad_id?: string | null
          ad_set_id?: string | null
          campaign_id?: string | null
          captured_at?: string | null
          contact_id?: string | null
          cost?: number | null
          created_at?: string
          deal_id?: string | null
          form_id?: string | null
          id?: string
          lead_form_id?: string | null
          source_type?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_sources_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_sources_ad_set_id_fkey"
            columns: ["ad_set_id"]
            isOneToOne: false
            referencedRelation: "ad_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_sources_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_sources_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_sources_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_sources_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_sources_lead_form_id_fkey"
            columns: ["lead_form_id"]
            isOneToOne: false
            referencedRelation: "lead_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_sources_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chat_widgets: {
        Row: {
          accent_color: string
          avatar_url: string | null
          business_hours: Json | null
          collect_fields: Json
          created_at: string
          id: string
          is_active: boolean
          offline_message: string | null
          position: string
          token: string
          updated_at: string
          welcome_message: string
          workspace_id: string
        }
        Insert: {
          accent_color?: string
          avatar_url?: string | null
          business_hours?: Json | null
          collect_fields?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          offline_message?: string | null
          position?: string
          token?: string
          updated_at?: string
          welcome_message?: string
          workspace_id: string
        }
        Update: {
          accent_color?: string
          avatar_url?: string | null
          business_hours?: Json | null
          collect_fields?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          offline_message?: string | null
          position?: string
          token?: string
          updated_at?: string
          welcome_message?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_widgets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      loss_reasons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loss_reasons_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      media_tiers: {
        Row: {
          created_at: string
          fee_monthly: number
          id: string
          is_active: boolean
          label: string
          max_monthly: number
        }
        Insert: {
          created_at?: string
          fee_monthly: number
          id?: string
          is_active?: boolean
          label: string
          max_monthly: number
        }
        Update: {
          created_at?: string
          fee_monthly?: number
          id?: string
          is_active?: boolean
          label?: string
          max_monthly?: number
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          is_required: boolean
          price_monthly: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          price_monthly?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          price_monthly?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          company_id: string | null
          contact_id: string | null
          content: string
          created_at: string
          deal_id: string | null
          id: string
          updated_at: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          content: string
          created_at?: string
          deal_id?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          content?: string
          created_at?: string
          deal_id?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_lost: boolean
          is_won: boolean
          name: string
          pipeline_id: string
          position: number
          probability: number
          rotting_days: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_lost?: boolean
          is_won?: boolean
          name: string
          pipeline_id: string
          position?: number
          probability?: number
          rotting_days?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_lost?: boolean
          is_won?: boolean
          name?: string
          pipeline_id?: string
          position?: number
          probability?: number
          rotting_days?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          name: string
          position: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          position?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          position?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          billing_cycle: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          sku: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          sku?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sku?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          blocks: Json
          created_at: string
          default_validity_days: number
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          blocks?: Json
          created_at?: string
          default_validity_days?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          blocks?: Json
          created_at?: string
          default_validity_days?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          accepted_at: string | null
          contact_id: string | null
          content: Json
          created_at: string
          created_by_user_id: string | null
          deal_id: string | null
          decline_reason: string | null
          declined_at: string | null
          discount: number
          id: string
          payment_terms: string | null
          pdf_url: string | null
          products: Json
          share_token: string | null
          status: string
          subtotal: number
          tax: number
          template_id: string | null
          title: string
          total: number
          updated_at: string
          validity_date: string | null
          version: number
          viewed_at: string | null
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          contact_id?: string | null
          content?: Json
          created_at?: string
          created_by_user_id?: string | null
          deal_id?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          discount?: number
          id?: string
          payment_terms?: string | null
          pdf_url?: string | null
          products?: Json
          share_token?: string | null
          status?: string
          subtotal?: number
          tax?: number
          template_id?: string | null
          title: string
          total?: number
          updated_at?: string
          validity_date?: string | null
          version?: number
          viewed_at?: string | null
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          contact_id?: string | null
          content?: Json
          created_at?: string
          created_by_user_id?: string | null
          deal_id?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          discount?: number
          id?: string
          payment_terms?: string | null
          pdf_url?: string | null
          products?: Json
          share_token?: string | null
          status?: string
          subtotal?: number
          tax?: number
          template_id?: string | null
          title?: string
          total?: number
          updated_at?: string
          validity_date?: string | null
          version?: number
          viewed_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "proposal_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      report_schedules: {
        Row: {
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          frequency: string
          id: string
          is_active: boolean
          last_sent_at: string | null
          name: string
          next_send_at: string | null
          recipients_email: string[] | null
          recipients_whatsapp: string[] | null
          send_time: string
          template_id: string
          timezone: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          name: string
          next_send_at?: string | null
          recipients_email?: string[] | null
          recipients_whatsapp?: string[] | null
          send_time?: string
          template_id: string
          timezone?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          name?: string
          next_send_at?: string | null
          recipients_email?: string[] | null
          recipients_whatsapp?: string[] | null
          send_time?: string
          template_id?: string
          timezone?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_schedules_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          branding: Json | null
          channels: Json
          client_info: Json | null
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          name: string
          sections: Json
          type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          branding?: Json | null
          channels?: Json
          client_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          sections?: Json
          type: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          branding?: Json | null
          channels?: Json
          client_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          sections?: Json
          type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          ai_recommendations: Json | null
          ai_summary: string | null
          branding: Json | null
          created_at: string
          created_by_user_id: string | null
          data_snapshot: Json | null
          id: string
          language: string
          name: string
          pdf_url: string | null
          period_end: string
          period_start: string
          share_password: string | null
          share_token: string | null
          status: string
          template_id: string | null
          type: string
          workspace_id: string
        }
        Insert: {
          ai_recommendations?: Json | null
          ai_summary?: string | null
          branding?: Json | null
          created_at?: string
          created_by_user_id?: string | null
          data_snapshot?: Json | null
          id?: string
          language?: string
          name: string
          pdf_url?: string | null
          period_end: string
          period_start: string
          share_password?: string | null
          share_token?: string | null
          status?: string
          template_id?: string | null
          type: string
          workspace_id: string
        }
        Update: {
          ai_recommendations?: Json | null
          ai_summary?: string | null
          branding?: Json | null
          created_at?: string
          created_by_user_id?: string | null
          data_snapshot?: Json | null
          id?: string
          language?: string
          name?: string
          pdf_url?: string | null
          period_end?: string
          period_start?: string
          share_password?: string | null
          share_token?: string | null
          status?: string
          template_id?: string | null
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sdr_calls: {
        Row: {
          ai_sentiment: string | null
          ai_summary: string | null
          attempt_number: number
          contact_id: string | null
          created_at: string
          deal_id: string | null
          disqualification_reason: string | null
          duration_seconds: number
          ended_at: string | null
          id: string
          meeting_scheduled_at: string | null
          phone_number_called: string
          qualification_result: string | null
          recording_url: string | null
          started_at: string | null
          status: string
          transcript: string | null
          voice_call_id: string | null
          workspace_id: string
        }
        Insert: {
          ai_sentiment?: string | null
          ai_summary?: string | null
          attempt_number?: number
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          disqualification_reason?: string | null
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          meeting_scheduled_at?: string | null
          phone_number_called: string
          qualification_result?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: string
          transcript?: string | null
          voice_call_id?: string | null
          workspace_id: string
        }
        Update: {
          ai_sentiment?: string | null
          ai_summary?: string | null
          attempt_number?: number
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          disqualification_reason?: string | null
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          meeting_scheduled_at?: string | null
          phone_number_called?: string
          qualification_result?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: string
          transcript?: string | null
          voice_call_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sdr_calls_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sdr_calls_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sdr_calls_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sdr_configs: {
        Row: {
          attempt_intervals: Json
          calendar_integration: Json | null
          created_at: string
          id: string
          is_active: boolean
          language: string
          max_attempts: number
          phone_number: string | null
          qualification_script: Json
          tone: string
          updated_at: string
          voice_assistant_id: string | null
          working_hours: Json
          workspace_id: string
        }
        Insert: {
          attempt_intervals?: Json
          calendar_integration?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          language?: string
          max_attempts?: number
          phone_number?: string | null
          qualification_script?: Json
          tone?: string
          updated_at?: string
          voice_assistant_id?: string | null
          working_hours?: Json
          workspace_id: string
        }
        Update: {
          attempt_intervals?: Json
          calendar_integration?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          language?: string
          max_attempts?: number
          phone_number?: string | null
          qualification_script?: Json
          tone?: string
          updated_at?: string
          voice_assistant_id?: string | null
          working_hours?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sdr_configs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sdr_queue: {
        Row: {
          assigned_user_id: string | null
          attempts_made: number
          contact_id: string | null
          created_at: string
          deal_id: string | null
          id: string
          lead_score: number
          next_attempt_at: string | null
          priority: number
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assigned_user_id?: string | null
          attempts_made?: number
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          lead_score?: number
          next_attempt_at?: string | null
          priority?: number
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assigned_user_id?: string | null
          attempts_made?: number
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          lead_score?: number
          next_attempt_at?: string | null
          priority?: number
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sdr_queue_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sdr_queue_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sdr_queue_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sdr_queue_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_steps: {
        Row: {
          body: string | null
          channel: string
          config: Json | null
          created_at: string
          delay_days: number
          delay_hours: number
          id: string
          position: number
          sequence_id: string
          subject: string | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          channel: string
          config?: Json | null
          created_at?: string
          delay_days?: number
          delay_hours?: number
          id?: string
          position: number
          sequence_id: string
          subject?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          channel?: string
          config?: Json | null
          created_at?: string
          delay_days?: number
          delay_hours?: number
          id?: string
          position?: number
          sequence_id?: string
          subject?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      sequences: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          target_entity: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          target_entity?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          target_entity?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequences_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token_encrypted: string | null
          account_id: string
          account_name: string
          avatar_url: string | null
          created_at: string
          id: string
          linked_ad_account_id: string | null
          permissions: Json
          platform: string
          profile_url: string | null
          refresh_token_encrypted: string | null
          status: string
          token_expires_at: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          account_id: string
          account_name: string
          avatar_url?: string | null
          created_at?: string
          id?: string
          linked_ad_account_id?: string | null
          permissions?: Json
          platform: string
          profile_url?: string | null
          refresh_token_encrypted?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          account_id?: string
          account_name?: string
          avatar_url?: string | null
          created_at?: string
          id?: string
          linked_ad_account_id?: string | null
          permissions?: Json
          platform?: string
          profile_url?: string | null
          refresh_token_encrypted?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_linked_ad_account_id_fkey"
            columns: ["linked_ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_library: {
        Row: {
          ad_creative_id: string | null
          created_at: string
          dimensions: Json | null
          duration_seconds: number | null
          file_size: number | null
          file_url: string
          folder: string | null
          id: string
          name: string
          tags: string[] | null
          thumbnail_url: string | null
          type: string
          uploaded_by_user_id: string | null
          workspace_id: string
        }
        Insert: {
          ad_creative_id?: string | null
          created_at?: string
          dimensions?: Json | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url: string
          folder?: string | null
          id?: string
          name: string
          tags?: string[] | null
          thumbnail_url?: string | null
          type: string
          uploaded_by_user_id?: string | null
          workspace_id: string
        }
        Update: {
          ad_creative_id?: string | null
          created_at?: string
          dimensions?: Json | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url?: string
          folder?: string | null
          id?: string
          name?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          type?: string
          uploaded_by_user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_library_ad_creative_id_fkey"
            columns: ["ad_creative_id"]
            isOneToOne: false
            referencedRelation: "ad_creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_media_library_uploaded_by_user_id_fkey"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_media_library_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      social_post_metrics: {
        Row: {
          clicks: number
          collected_at: string
          comments: number
          created_at: string
          engagement_rate: number
          id: string
          impressions: number
          likes: number
          platform: string
          provider_post_id: string | null
          reach: number
          saves: number
          shares: number
          social_post_id: string
          video_views: number
        }
        Insert: {
          clicks?: number
          collected_at?: string
          comments?: number
          created_at?: string
          engagement_rate?: number
          id?: string
          impressions?: number
          likes?: number
          platform: string
          provider_post_id?: string | null
          reach?: number
          saves?: number
          shares?: number
          social_post_id: string
          video_views?: number
        }
        Update: {
          clicks?: number
          collected_at?: string
          comments?: number
          created_at?: string
          engagement_rate?: number
          id?: string
          impressions?: number
          likes?: number
          platform?: string
          provider_post_id?: string | null
          reach?: number
          saves?: number
          shares?: number
          social_post_id?: string
          video_views?: number
        }
        Relationships: [
          {
            foreignKeyName: "social_post_metrics_social_post_id_fkey"
            columns: ["social_post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          ai_suggestions: Json | null
          approval_token: string | null
          approved_at: string | null
          approved_by: string | null
          boost_campaign_id: string | null
          content_text: string | null
          created_at: string
          created_by_user_id: string | null
          first_comment: string | null
          hashtags: string[] | null
          id: string
          landing_page_id: string | null
          media_urls: Json
          platforms: Json
          published_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          ai_suggestions?: Json | null
          approval_token?: string | null
          approved_at?: string | null
          approved_by?: string | null
          boost_campaign_id?: string | null
          content_text?: string | null
          created_at?: string
          created_by_user_id?: string | null
          first_comment?: string | null
          hashtags?: string[] | null
          id?: string
          landing_page_id?: string | null
          media_urls?: Json
          platforms?: Json
          published_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          ai_suggestions?: Json | null
          approval_token?: string | null
          approved_at?: string | null
          approved_by?: string | null
          boost_campaign_id?: string | null
          content_text?: string | null
          created_at?: string
          created_by_user_id?: string | null
          first_comment?: string | null
          hashtags?: string[] | null
          id?: string
          landing_page_id?: string | null
          media_urls?: Json
          platforms?: Json
          published_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_boost_campaign_id_fkey"
            columns: ["boost_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          basket_id: string | null
          cancel_at_period_end: boolean
          cancel_reason: string | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          custom_modules: Json | null
          id: string
          media_tier_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          basket_id?: string | null
          cancel_at_period_end?: boolean
          cancel_reason?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          custom_modules?: Json | null
          id?: string
          media_tier_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          basket_id?: string | null
          cancel_at_period_end?: boolean
          cancel_reason?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          custom_modules?: Json | null
          id?: string
          media_tier_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_basket_id_fkey"
            columns: ["basket_id"]
            isOneToOne: false
            referencedRelation: "baskets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_media_tier_id_fkey"
            columns: ["media_tier_id"]
            isOneToOne: false
            referencedRelation: "media_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_records: {
        Row: {
          current_count: number
          id: string
          limit_count: number
          period_end: string
          period_start: string
          resource: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          current_count?: number
          id?: string
          limit_count?: number
          period_end: string
          period_start: string
          resource: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          current_count?: number
          id?: string
          limit_count?: number
          period_end?: string
          period_start?: string
          resource?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean
          joined_at: string | null
          last_seen_at: string | null
          name: string | null
          phone: string | null
          role: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string | null
          last_seen_at?: string | null
          name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string | null
          last_seen_at?: string | null
          name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string
          direction: string
          error: string | null
          event: string | null
          id: string
          payload: Json | null
          response_body: string | null
          response_status: number | null
          webhook_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          direction: string
          error?: string | null
          event?: string | null
          id?: string
          payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          direction?: string
          error?: string | null
          event?: string | null
          id?: string
          payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          events: Json
          id: string
          is_active: boolean
          name: string
          secret: string | null
          updated_at: string
          url: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          events?: Json
          id?: string
          is_active?: boolean
          name: string
          secret?: string | null
          updated_at?: string
          url: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          events?: Json
          id?: string
          is_active?: boolean
          name?: string
          secret?: string | null
          updated_at?: string
          url?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          language: string
          meta_template_id: string | null
          name: string
          status: string | null
          updated_at: string
          variables: Json | null
          workspace_id: string
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          language?: string
          meta_template_id?: string | null
          name: string
          status?: string | null
          updated_at?: string
          variables?: Json | null
          workspace_id: string
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          language?: string
          meta_template_id?: string | null
          name?: string
          status?: string | null
          updated_at?: string
          variables?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_branding: {
        Row: {
          accent_color: string
          accent_color_light: string | null
          created_at: string
          favicon_url: string | null
          id: string
          logo_icon_url: string | null
          logo_url: string | null
          secondary_color: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          accent_color?: string
          accent_color_light?: string | null
          created_at?: string
          favicon_url?: string | null
          id?: string
          logo_icon_url?: string | null
          logo_url?: string | null
          secondary_color?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          accent_color?: string
          accent_color_light?: string | null
          created_at?: string
          favicon_url?: string | null
          id?: string
          logo_icon_url?: string | null
          logo_url?: string | null
          secondary_color?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_branding_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_modules: {
        Row: {
          enabled: boolean
          enabled_at: string
          module_id: string
          source: string
          workspace_id: string
        }
        Insert: {
          enabled?: boolean
          enabled_at?: string
          module_id: string
          source?: string
          workspace_id: string
        }
        Update: {
          enabled?: boolean
          enabled_at?: string
          module_id?: string
          source?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_modules_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          currency: string
          domain: string | null
          id: string
          locale: string
          name: string
          owner_user_id: string | null
          settings: Json
          slug: string
          subdomain: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          domain?: string | null
          id?: string
          locale?: string
          name: string
          owner_user_id?: string | null
          settings?: Json
          slug: string
          subdomain?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          domain?: string | null
          id?: string
          locale?: string
          name?: string
          owner_user_id?: string | null
          settings?: Json
          slug?: string
          subdomain?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_fk"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adopt_user_into_demo: { Args: { p_email: string }; Returns: string }
      check_plan_limit: {
        Args: { p_resource: string; p_workspace_id: string }
        Returns: Json
      }
      current_user_role: { Args: never; Returns: string }
      current_workspace_id: { Args: never; Returns: string }
      get_workspace_enabled_modules: {
        Args: { p_workspace_id: string }
        Returns: string[]
      }
      increment_usage: {
        Args: { p_amount?: number; p_resource: string; p_workspace_id: string }
        Returns: undefined
      }
      is_workspace_admin: { Args: never; Returns: boolean }
      is_workspace_writer: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

