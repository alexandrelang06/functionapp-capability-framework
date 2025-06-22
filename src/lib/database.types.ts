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
      companies: {
        Row: {
          id: string
          name: string
          industry: string | null
          country: string | null
          company_size: '< 500' | '500 - 2 000' | '2 000 - 10 000' | '10 000 - 50 000' | '50 000 - 200 000' | '> 200 000' | null
          annual_revenue: '< 250M€' | '250M€ - 500M€' | '500M€ - 1Md€' | '1Md€ - 10Bd€' | '+10Bd€' | null
          exact_employees: number | null
          effective_revenue: number | null
          created_at: string
          created_by: string | null
          it_department_size: number | null
          annual_it_cost: number | null
          it_budget_percentage: number | null
        }
        Insert: {
          id?: string
          name: string
          industry?: string | null
          country?: string | null
          company_size?: string | null
          annual_revenue?: string | null
          created_at?: string
          created_by?: string | null
          it_department_size?: number | null
          annual_it_cost?: number | null
          it_budget_percentage?: number | null
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          country?: string | null
          company_size?: string | null
          annual_revenue?: string | null
          created_at?: string
          created_by?: string | null
          it_department_size?: number | null
          annual_it_cost?: number | null
          it_budget_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      domains: {
        Row: {
          id: string
          title: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          description?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          domain_id: string
          title: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          domain_id: string
          title: string
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          domain_id?: string
          title?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_domain_id_fkey"
            columns: ["domain_id"]
            referencedRelation: "domains"
            referencedColumns: ["id"]
          }
        ]
      }
      processes: {
        Row: {
          id: string
          category_id: string
          name: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          category_id: string
          name: string
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processes_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      sub_processes: {
        Row: {
          id: string
          process_id: string
          name: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          process_id: string
          name: string
          description?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          process_id?: string
          name?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_processes_process_id_fkey"
            columns: ["process_id"]
            referencedRelation: "processes"
            referencedColumns: ["id"]
          }
        ]
      }
      assessments: {
        Row: {
          id: string
          company_id: string
          title: string
          job_code: string | null
          status: string
          is_open: boolean
          completion_percentage: number
          created_by: string | null
          created_at: string
          updated_at: string
          scope: string | null
          objectives: string | null
          methodology: string | null
          stakeholders: string | null
          constraints: string | null
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          job_code?: string | null
          status?: string
          is_open?: boolean
          completion_percentage?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
          scope?: string | null
          objectives?: string | null
          methodology?: string | null
          stakeholders?: string | null
          constraints?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          job_code?: string | null
          status?: string
          is_open?: boolean
          completion_percentage?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
          scope?: string | null
          objectives?: string | null
          methodology?: string | null
          stakeholders?: string | null
          constraints?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      scores: {
        Row: {
          id: string
          assessment_id: string
          process_id: string
          score: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          process_id: string
          score: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          process_id?: string
          score?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_assessment_id_fkey"
            columns: ["assessment_id"]
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_process_id_fkey"
            columns: ["process_id"]
            referencedRelation: "processes"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      domain_scores: {
        Row: {
          assessment_id: string | null
          domain_id: string | null
          avg_score: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_id_fkey"
            columns: ["assessment_id"]
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domains_id_fkey"
            columns: ["domain_id"]
            referencedRelation: "domains"
            referencedColumns: ["id"]
          }
        ]
      }
      category_scores: {
        Row: {
          assessment_id: string | null
          category_id: string | null
          domain_id: string | null
          avg_score: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_id_fkey"
            columns: ["assessment_id"]
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domains_id_fkey"
            columns: ["domain_id"]
            referencedRelation: "domains"
            referencedColumns: ["id"]
          }
        ]
      }
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