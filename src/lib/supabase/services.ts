import { supabase } from './client';
import { ResumeData, AnalysisResult, JobInput } from '../types';

// Cast to any to bypass untyped Supabase table errors
const db = supabase as any;

export class ResumeService {
  /**
   * Save a resume to the database
   */
  static async saveResume(
    userId: string,
    fileName: string,
    rawText: string,
    parsedData: ResumeData,
    fileUrl?: string
  ) {
    const { data, error } = await db
      .from('resumes')
      .insert({
        user_id: userId,
        file_name: fileName,
        file_url: fileUrl,
        raw_text: rawText,
        parsed_data: parsedData as any,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all resumes for a user
   */
  static async getUserResumes(userId: string) {
    const { data, error } = await db
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a specific resume
   */
  static async getResume(resumeId: string) {
    const { data, error } = await db
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a resume
   */
  static async deleteResume(resumeId: string) {
    const { error } = await db
      .from('resumes')
      .delete()
      .eq('id', resumeId);

    if (error) throw error;
  }

  /**
   * Upload resume file to storage
   */
  static async uploadResumeFile(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    return { path: data.path, url: publicUrl };
  }
}

export class AnalysisService {
  /**
   * Save an analysis result
   */
  static async saveAnalysis(
    userId: string,
    resumeId: string,
    jobInput: JobInput,
    result: AnalysisResult
  ) {
    const { data, error } = await db
      .from('analyses')
      .insert({
        user_id: userId,
        resume_id: resumeId,
        job_title: jobInput.jobTitle,
        job_seniority: jobInput.seniority,
        job_industry: jobInput.industry,
        overall_score: result.overallScore,
        section_scores: result.sectionScores as any,
        summary: result.summary,
        top_actions: result.topActions as any,
        rewrites: result.rewrites as any,
        keywords_to_add: result.keywordsToAdd,
        ats_checklist: result.atsChecklist as any,
        explainability: result.explainability as any,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all analyses for a resume
   */
  static async getResumeAnalyses(resumeId: string) {
    const { data, error } = await db
      .from('analyses')
      .select('*')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get user's analysis history
   */
  static async getUserAnalyses(userId: string, limit = 10) {
    const { data, error } = await db
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

export class VersionService {
  /**
   * Save a resume version
   */
  static async saveVersion(
    userId: string,
    resumeId: string,
    versionName: string,
    jobInput: JobInput,
    resumeData: ResumeData,
    analysisResult?: AnalysisResult,
    tags?: string[]
  ) {
    const { data, error } = await db
      .from('resume_versions')
      .insert({
        user_id: userId,
        resume_id: resumeId,
        version_name: versionName,
        job_title: jobInput.jobTitle,
        job_industry: jobInput.industry,
        job_seniority: jobInput.seniority,
        resume_data: resumeData as any,
        analysis_result: analysisResult as any,
        tags,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all versions for a resume
   */
  static async getResumeVersions(resumeId: string) {
    const { data, error } = await db
      .from('resume_versions')
      .select('*')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a specific version
   */
  static async getVersion(versionId: string) {
    const { data, error } = await db
      .from('resume_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a version
   */
  static async deleteVersion(versionId: string) {
    const { error } = await db
      .from('resume_versions')
      .delete()
      .eq('id', versionId);

    if (error) throw error;
  }
}

export class ProfileService {
  /**
   * Get user profile
   */
  static async getProfile(userId: string) {
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updates: {
      full_name?: string;
      avatar_url?: string;
      linkedin_url?: string;
    }
  ) {
    const { data, error } = await db
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create profile (called after signup)
   */
  static async createProfile(userId: string, email: string, fullName?: string) {
    const { data, error } = await db
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
