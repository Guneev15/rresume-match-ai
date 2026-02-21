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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          linkedin_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_url: string | null
          raw_text: string
          parsed_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_url?: string | null
          raw_text: string
          parsed_data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_url?: string | null
          raw_text?: string
          parsed_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      resume_versions: {
        Row: {
          id: string
          resume_id: string
          user_id: string
          version_name: string
          job_title: string | null
          job_industry: string | null
          job_seniority: string | null
          resume_data: Json
          analysis_result: Json | null
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          resume_id: string
          user_id: string
          version_name: string
          job_title?: string | null
          job_industry?: string | null
          job_seniority?: string | null
          resume_data: Json
          analysis_result?: Json | null
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          user_id?: string
          version_name?: string
          job_title?: string | null
          job_industry?: string | null
          job_seniority?: string | null
          resume_data?: Json
          analysis_result?: Json | null
          tags?: string[] | null
          created_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          resume_id: string
          user_id: string
          job_title: string
          job_seniority: string | null
          job_industry: string | null
          overall_score: number
          section_scores: Json
          summary: string
          top_actions: Json
          rewrites: Json | null
          keywords_to_add: string[] | null
          ats_checklist: Json | null
          explainability: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          resume_id: string
          user_id: string
          job_title: string
          job_seniority?: string | null
          job_industry?: string | null
          overall_score: number
          section_scores: Json
          summary: string
          top_actions: Json
          rewrites?: Json | null
          keywords_to_add?: string[] | null
          ats_checklist?: Json | null
          explainability?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          user_id?: string
          job_title?: string
          job_seniority?: string | null
          job_industry?: string | null
          overall_score?: number
          section_scores?: Json
          summary?: string
          top_actions?: Json
          rewrites?: Json | null
          keywords_to_add?: string[] | null
          ats_checklist?: Json | null
          explainability?: Json | null
          created_at?: string
        }
      }
      job_recommendations: {
        Row: {
          id: string
          user_id: string
          resume_id: string | null
          job_title: string
          company: string
          location: string | null
          remote: boolean | null
          salary_min: number | null
          salary_max: number | null
          match_score: number
          matched_skills: string[] | null
          missing_skills: string[] | null
          description: string | null
          url: string | null
          source: string | null
          saved: boolean | null
          applied: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resume_id?: string | null
          job_title: string
          company: string
          location?: string | null
          remote?: boolean | null
          salary_min?: number | null
          salary_max?: number | null
          match_score: number
          matched_skills?: string[] | null
          missing_skills?: string[] | null
          description?: string | null
          url?: string | null
          source?: string | null
          saved?: boolean | null
          applied?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resume_id?: string | null
          job_title?: string
          company?: string
          location?: string | null
          remote?: boolean | null
          salary_min?: number | null
          salary_max?: number | null
          match_score?: number
          matched_skills?: string[] | null
          missing_skills?: string[] | null
          description?: string | null
          url?: string | null
          source?: string | null
          saved?: boolean | null
          applied?: boolean | null
          created_at?: string
        }
      }
      cover_letters: {
        Row: {
          id: string
          user_id: string
          resume_id: string | null
          job_title: string
          company: string
          content: Json
          tone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resume_id?: string | null
          job_title: string
          company: string
          content: Json
          tone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resume_id?: string | null
          job_title?: string
          company?: string
          content?: Json
          tone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      interview_prep: {
        Row: {
          id: string
          user_id: string
          resume_id: string | null
          job_title: string
          technical_questions: Json | null
          behavioral_questions: Json | null
          skill_gap_questions: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resume_id?: string | null
          job_title: string
          technical_questions?: Json | null
          behavioral_questions?: Json | null
          skill_gap_questions?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resume_id?: string | null
          job_title?: string
          technical_questions?: Json | null
          behavioral_questions?: Json | null
          skill_gap_questions?: string[] | null
          created_at?: string
        }
      }
      learning_roadmaps: {
        Row: {
          id: string
          user_id: string
          resume_id: string | null
          missing_skills: Json
          timeline: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resume_id?: string | null
          missing_skills: Json
          timeline?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resume_id?: string | null
          missing_skills?: Json
          timeline?: Json | null
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string | null
          feature_id: string
          rating: number | null
          comment: string | null
          anonymous: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          feature_id: string
          rating?: number | null
          comment?: string | null
          anonymous?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          feature_id?: string
          rating?: number | null
          comment?: string | null
          anonymous?: boolean | null
          created_at?: string
        }
      }
    }
  }
}
