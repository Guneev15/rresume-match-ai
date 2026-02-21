import { ResumeData, JobInput } from '../types';

export interface SkillMatch {
  skill: string;
  proficiency: number; // 0-100
  evidence: string[];
}

export interface MissingSkill {
  skill: string;
  importance: 'critical' | 'high' | 'medium';
  learningResources?: string[];
}

export interface ExperienceCategory {
  category: string;
  years: number;
}

export interface SkillGapAnalysis {
  matchedSkills: SkillMatch[];
  missingSkills: MissingSkill[];
  experienceDistribution: ExperienceCategory[];
  overallStrength: number; // 0-100
}

/**
 * Analyze skill gaps between resume and job requirements
 */
export function analyzeSkillGaps(
  resume: ResumeData,
  jobInput: JobInput
): SkillGapAnalysis {
  const jobTitle = jobInput.jobTitle.toLowerCase();
  const industry = jobInput.industry?.toLowerCase() || '';
  
  // Define required skills based on job title
  const requiredSkills = getRequiredSkills(jobTitle, industry);
  
  // Match resume skills against required skills
  const resumeSkills = resume.skills.map(s => s.toLowerCase());
  const matchedSkills: SkillMatch[] = [];
  const missingSkills: MissingSkill[] = [];
  
  requiredSkills.forEach(req => {
    const isMatched = resumeSkills.some(rs => 
      rs.includes(req.skill) || req.skill.includes(rs)
    );
    
    if (isMatched) {
      // Find evidence in experience
      const evidence = resume.experience
        .flatMap(exp => exp.bullets)
        .filter(bullet => bullet.toLowerCase().includes(req.skill))
        .slice(0, 2);
      
      matchedSkills.push({
        skill: req.skill,
        proficiency: calculateProficiency(req.skill, resume),
        evidence: evidence.length > 0 ? evidence : ['Skill listed in resume'],
      });
    } else {
      missingSkills.push({
        skill: req.skill,
        importance: req.importance,
        learningResources: req.resources,
      });
    }
  });
  
  // Calculate experience distribution
  const experienceDistribution = calculateExperienceDistribution(resume);
  
  // Calculate overall strength
  const overallStrength = Math.round(
    (matchedSkills.length / requiredSkills.length) * 100
  );
  
  return {
    matchedSkills,
    missingSkills,
    experienceDistribution,
    overallStrength,
  };
}

/**
 * Get required skills for a job title
 */
function getRequiredSkills(jobTitle: string, industry: string): Array<{
  skill: string;
  importance: 'critical' | 'high' | 'medium';
  resources?: string[];
}> {
  const skillSets: Record<string, Array<{
    skill: string;
    importance: 'critical' | 'high' | 'medium';
    resources?: string[];
  }>> = {
    'software engineer': [
      { skill: 'javascript', importance: 'critical', resources: ['JavaScript.info', 'MDN Web Docs'] },
      { skill: 'typescript', importance: 'high', resources: ['TypeScript Handbook'] },
      { skill: 'react', importance: 'high', resources: ['React Docs', 'React Course'] },
      { skill: 'node.js', importance: 'high', resources: ['Node.js Docs'] },
      { skill: 'sql', importance: 'critical', resources: ['SQL Tutorial'] },
      { skill: 'git', importance: 'critical', resources: ['Pro Git Book'] },
      { skill: 'rest api', importance: 'high' },
      { skill: 'testing', importance: 'medium', resources: ['Jest Docs'] },
    ],
    'data scientist': [
      { skill: 'python', importance: 'critical', resources: ['Python.org'] },
      { skill: 'machine learning', importance: 'critical', resources: ['Coursera ML'] },
      { skill: 'pandas', importance: 'critical', resources: ['Pandas Docs'] },
      { skill: 'sql', importance: 'critical' },
      { skill: 'statistics', importance: 'critical', resources: ['Khan Academy'] },
      { skill: 'tensorflow', importance: 'high', resources: ['TensorFlow Tutorials'] },
      { skill: 'data visualization', importance: 'high' },
    ],
    'product manager': [
      { skill: 'product strategy', importance: 'critical' },
      { skill: 'agile', importance: 'critical', resources: ['Scrum Guide'] },
      { skill: 'user research', importance: 'high' },
      { skill: 'data analysis', importance: 'high' },
      { skill: 'roadmapping', importance: 'high' },
      { skill: 'stakeholder management', importance: 'critical' },
    ],
  };
  
  // Find matching skill set
  for (const [key, skills] of Object.entries(skillSets)) {
    if (jobTitle.includes(key)) {
      return skills;
    }
  }
  
  // Default generic skills
  return [
    { skill: 'communication', importance: 'critical' },
    { skill: 'problem solving', importance: 'critical' },
    { skill: 'teamwork', importance: 'high' },
    { skill: 'leadership', importance: 'medium' },
  ];
}

/**
 * Calculate proficiency level for a skill
 */
function calculateProficiency(skill: string, resume: ResumeData): number {
  let proficiency = 50; // Base proficiency
  
  // Check if skill appears in recent experience
  const recentExperience = resume.experience.slice(0, 2);
  const appearsInRecent = recentExperience.some(exp =>
    exp.bullets.some(bullet => bullet.toLowerCase().includes(skill))
  );
  
  if (appearsInRecent) proficiency += 20;
  
  // Check frequency of mentions
  const mentions = resume.experience
    .flatMap(exp => exp.bullets)
    .filter(bullet => bullet.toLowerCase().includes(skill))
    .length;
  
  proficiency += Math.min(mentions * 5, 30);
  
  return Math.min(proficiency, 100);
}

/**
 * Calculate experience distribution by category
 */
function calculateExperienceDistribution(resume: ResumeData): ExperienceCategory[] {
  const categories: Record<string, number> = {};
  
  resume.experience.forEach(exp => {
    const title = exp.title.toLowerCase();
    let category = 'Other';
    
    if (title.includes('engineer') || title.includes('developer')) {
      category = 'Engineering';
    } else if (title.includes('manager') || title.includes('lead')) {
      category = 'Management';
    } else if (title.includes('analyst') || title.includes('data')) {
      category = 'Analytics';
    } else if (title.includes('design')) {
      category = 'Design';
    }
    
    // Calculate years (rough estimate)
    const years = exp.duration ? parseYears(exp.duration) : 1;
    categories[category] = (categories[category] || 0) + years;
  });
  
  return Object.entries(categories).map(([category, years]) => ({
    category,
    years,
  }));
}

/**
 * Parse years from duration string
 */
function parseYears(duration: string): number {
  const yearMatch = duration.match(/(\d+)\s*year/i);
  const monthMatch = duration.match(/(\d+)\s*month/i);
  
  let years = 0;
  if (yearMatch) years += parseInt(yearMatch[1]);
  if (monthMatch) years += parseInt(monthMatch[1]) / 12;
  
  return Math.max(years, 0.5); // Minimum 6 months
}
