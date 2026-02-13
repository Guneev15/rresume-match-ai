export interface JobInput {
  jobTitle: string;
  seniority: 'junior' | 'mid' | 'senior';
  industry: string;
}

export interface ResumeData {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  headline: string | null;
  summary: string | null;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: string[];
  projects: ProjectEntry[];
  achievements: string[];
  rawText: string;
  parseWarnings: string[];
}

export interface ExperienceEntry {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  bullets: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  stack: string[];
}

export interface SectionScores {
  skillsMatch: number;
  experienceMatch: number;
  education: number;
  atsReadability: number;
  achievementQuality: number;
}

export interface ActionItem {
  priority: number;
  text: string;
  why: string;
}

export interface Rewrite {
  original: string;
  improved: string;
  toneVariants?: {
    technical?: string;
    product?: string;
    leadership?: string;
  };
}

export interface AnalysisResult {
  overallScore: number;
  summary: string;
  sectionScores: SectionScores;
  topActions: ActionItem[];
  rewrites: Rewrite[];
  keywordsToAdd: string[];
  atsChecklist: { item: string; passed: boolean }[];
  explainability: {
    skillMatches: { skill: string; evidence: string[] }[];
    scoreBreakdown: string;
  };
}

export type AppState = 'input' | 'loading' | 'results';
