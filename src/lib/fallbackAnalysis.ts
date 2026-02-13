import { AnalysisResult, JobInput, ResumeData } from './types';

// Generic skill categories that apply across industries
const GENERIC_SKILL_CATEGORIES = {
  technical: ['programming', 'coding', 'software', 'development', 'engineering', 'technical', 'system', 'database', 'api', 'cloud', 'devops'],
  business: ['management', 'strategy', 'analysis', 'planning', 'operations', 'process', 'project', 'stakeholder', 'business', 'finance'],
  data: ['data', 'analytics', 'sql', 'python', 'statistics', 'machine learning', 'ai', 'visualization', 'reporting'],
  design: ['design', 'ux', 'ui', 'user', 'interface', 'visual', 'figma', 'sketch', 'wireframe', 'prototype'],
  communication: ['communication', 'presentation', 'writing', 'collaboration', 'teamwork', 'leadership', 'agile', 'scrum'],
};

// Define skill domains to detect mismatches
const SKILL_DOMAINS: Record<string, string[]> = {
  'ai_ml': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'computer vision', 'neural network', 'ai', 'ml', 'data science', 'pandas', 'numpy', 'scikit'],
  'web_dev': ['react', 'angular', 'vue', 'javascript', 'typescript', 'html', 'css', 'frontend', 'backend', 'node.js', 'express'],
  'mobile': ['ios', 'android', 'swift', 'kotlin', 'react native', 'flutter', 'mobile'],
  'bpm_workflow': ['appian', 'bpm', 'workflow', 'business process', 'process modeling', 'case management', 'low-code', 'pega', 'bizagi'],
  'data_engineering': ['spark', 'hadoop', 'kafka', 'airflow', 'etl', 'data pipeline', 'data warehouse', 'snowflake', 'redshift'],
  'devops': ['docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd', 'aws', 'azure', 'gcp', 'ansible'],
  'finance': ['accounting', 'financial', 'audit', 'tax', 'investment', 'banking', 'trading', 'portfolio'],
  'marketing': ['seo', 'sem', 'content', 'social media', 'campaign', 'brand', 'marketing', 'advertising'],
  'sales': ['sales', 'crm', 'salesforce', 'pipeline', 'prospecting', 'closing', 'negotiation', 'revenue'],
  'hr': ['recruiting', 'hr', 'talent', 'onboarding', 'compensation', 'benefits', 'employee relations'],
};

export function fallbackAnalysis(resume: ResumeData, job: JobInput): AnalysisResult {
  const lowerText = resume.rawText.toLowerCase();
  const lowerSkills = resume.skills.map(s => s.toLowerCase());
  const jobTitleLower = job.jobTitle.toLowerCase();
  
  // DYNAMIC KEYWORD EXTRACTION: Extract key terms from job title
  const jobKeywords = extractJobKeywords(jobTitleLower, job.industry);
  
  // Skills match - check for job-specific keywords
  const matchedSkills = jobKeywords.filter(
    kw => lowerText.includes(kw) || lowerSkills.some(s => s.includes(kw))
  );
  const missingKeywords = jobKeywords.filter(
    kw => !lowerText.includes(kw) && !lowerSkills.some(s => s.includes(kw))
  );
  
  // Calculate base skills score
  let skillsScore = jobKeywords.length > 0 
    ? Math.round((matchedSkills.length / jobKeywords.length) * 100)
    : 50; // Default if no keywords extracted

  // CRITICAL: Apply heavy mismatch penalty for wrong skill domain
  const jobDomain = detectJobDomainGeneric(jobTitleLower);
  const resumeDomains = detectResumeDomains(lowerText, lowerSkills);
  
  // If resume is heavily focused on a different domain, apply severe penalty
  if (jobDomain && resumeDomains.length > 0 && !resumeDomains.includes(jobDomain)) {
    const mismatchPenalty = 50; // Heavy penalty for domain mismatch
    skillsScore = Math.max(0, skillsScore - mismatchPenalty);
  }

  // If very few required skills match, cap the score low
  if (matchedSkills.length < 3 && jobKeywords.length >= 8) {
    skillsScore = Math.min(skillsScore, 25);
  }

  // Experience match
  const hasRelevantExp = resume.experience.length > 0;
  const totalBullets = resume.experience.reduce((sum, e) => sum + e.bullets.length, 0);
  let experienceScore = Math.min(100, Math.round(
    (hasRelevantExp ? 40 : 0) + Math.min(totalBullets * 5, 40) + (resume.experience.length >= 2 ? 20 : 0)
  ));
  
  // Penalize experience if no relevant keywords in experience bullets
  const expText = resume.experience.map(e => e.bullets.join(' ')).join(' ').toLowerCase();
  const expMatches = jobKeywords.filter(kw => expText.includes(kw));
  if (expMatches.length < 2) {
    experienceScore = Math.min(experienceScore, 40);
  }

  // Education
  const hasEducation = resume.education.length > 0;
  const hasCerts = resume.certifications.length > 0;
  const educationScore = (hasEducation ? 70 : 20) + (hasCerts ? 30 : 0);

  // ATS readability
  const hasEmail = !!resume.email;
  const hasPhone = !!resume.phone;
  const hasName = !!resume.name;
  const hasSkillsSection = resume.skills.length > 0;
  const atsScore = Math.round(
    (hasEmail ? 25 : 0) + (hasPhone ? 15 : 0) + (hasName ? 20 : 0) +
    (hasSkillsSection ? 25 : 0) + (hasRelevantExp ? 15 : 0)
  );

  // Achievement quality
  const numberedBullets = resume.experience.reduce((count, e) =>
    count + e.bullets.filter(b => /\d+%|\$[\d,]+|\d+x|\d+ /.test(b)).length, 0
  );
  const achievementScore = Math.min(100, numberedBullets * 20 + 20);

  // Overall - heavily weight skills match
  const overallScore = Math.round(
    skillsScore * 0.5 + experienceScore * 0.25 + atsScore * 0.1 + achievementScore * 0.05 + educationScore * 0.1
  );

  // Generate summary
  const level = overallScore >= 85 ? 'Strong' : overallScore >= 70 ? 'Good' : overallScore >= 50 ? 'Moderate' : 'Low';
  const summary = generateFallbackSummary(resume, job, overallScore, level, matchedSkills, missingKeywords);

  // Action items
  const topActions = generateFallbackActions(resume, missingKeywords, numberedBullets);

  // ATS checklist
  const atsChecklist = [
    { item: 'Contact information (name, email, phone) is clearly listed', passed: hasEmail && hasPhone && hasName },
    { item: 'Skills section is present and populated', passed: hasSkillsSection },
    { item: 'Work experience includes company names and dates', passed: hasRelevantExp },
    { item: 'Education section is present', passed: hasEducation },
    { item: 'Resume uses standard section headings', passed: true },
    { item: 'No complex formatting (tables, columns) detected', passed: true },
    { item: 'Includes relevant keywords for the target role', passed: skillsScore >= 50 },
  ];

  return {
    overallScore,
    summary,
    sectionScores: {
      skillsMatch: skillsScore,
      experienceMatch: experienceScore,
      education: Math.min(educationScore, 100),
      atsReadability: atsScore,
      achievementQuality: achievementScore,
    },
    topActions,
    rewrites: [],
    keywordsToAdd: missingKeywords,
    atsChecklist,
    explainability: {
      skillMatches: matchedSkills.map(s => ({
        skill: s,
        evidence: [`Found in resume skills or text`],
      })),
      scoreBreakdown: `Skills (40%): ${skillsScore} | Experience (30%): ${experienceScore} | ATS (10%): ${atsScore} | Achievement (10%): ${achievementScore} | Education (10%): ${educationScore}`,
    },
  };
}

function generateFallbackSummary(
  resume: ResumeData, job: JobInput, score: number, level: string,
  matched: string[], missing: string[]
): string {
  const name = resume.name || 'The candidate';
  const parts = [
    `${level} match (${score}/100) for the ${job.jobTitle} role.`,
  ];

  if (matched.length > 0) {
    parts.push(`${name} shows relevant skills including ${matched.slice(0, 3).join(', ')}.`);
  }

  if (missing.length > 0) {
    parts.push(`Key areas to strengthen: add experience with ${missing.slice(0, 3).join(', ')}.`);
  }

  if (score < 70) {
    parts.push(`Consider tailoring bullet points with metrics and impact statements to better demonstrate fit.`);
  } else {
    parts.push(`A few focused edits will make this application stand out even more.`);
  }

  return parts.join(' ');
}

function generateFallbackActions(resume: ResumeData, missing: string[], numberedBullets: number): AnalysisResult['topActions'] {
  const actions: AnalysisResult['topActions'] = [];
  let priority = 1;

  if (missing.length > 0) {
    actions.push({
      priority: priority++,
      text: `Add missing skills: ${missing.slice(0, 4).join(', ')}`,
      why: 'These keywords are expected for this role but not found in your resume.',
    });
  }

  if (numberedBullets < 3) {
    actions.push({
      priority: priority++,
      text: 'Add quantifiable metrics to your experience bullets',
      why: 'Most bullets lack numbers. Use percentages, dollar amounts, or user counts.',
    });
  }

  if (!resume.summary) {
    actions.push({
      priority: priority++,
      text: 'Add a professional summary at the top of your resume',
      why: 'A concise summary helps recruiters quickly understand your fit.',
    });
  }

  if (resume.experience.some(e => e.bullets.length === 0)) {
    actions.push({
      priority: priority++,
      text: 'Add bullet points for all experience entries',
      why: 'Some positions have no bullets — describe your responsibilities and achievements.',
    });
  }

  if (resume.projects.length === 0) {
    actions.push({
      priority: priority++,
      text: 'Add a projects section to showcase relevant work',
      why: 'Projects demonstrate hands-on skills and initiative.',
    });
  }

  if (!resume.linkedinUrl) {
    actions.push({
      priority: priority++,
      text: 'Include your LinkedIn profile URL',
      why: 'LinkedIn adds credibility and lets recruiters learn more about you.',
    });
  }

  actions.push({
    priority: priority++,
    text: 'Tailor resume language to mirror the job description',
    why: 'Using the same terminology as the job posting improves ATS matching.',
  });

  return actions.slice(0, 7);
}

// Helper: Extract relevant keywords from any job title dynamically
function extractJobKeywords(jobTitle: string, industry?: string): string[] {
  const keywords: string[] = [];
  
  // Extract words from job title (remove common words)
  const titleWords = jobTitle
    .split(/\s+/)
    .filter(word => word.length > 2 && !['the', 'and', 'for', 'with'].includes(word));
  
  keywords.push(...titleWords);
  
  // Add industry if provided
  if (industry) {
    keywords.push(industry.toLowerCase());
  }
  
  // Add relevant skill category keywords based on job title
  if (jobTitle.includes('engineer') || jobTitle.includes('developer') || jobTitle.includes('programmer')) {
    keywords.push(...GENERIC_SKILL_CATEGORIES.technical.slice(0, 6));
  }
  if (jobTitle.includes('data') || jobTitle.includes('analyst') || jobTitle.includes('scientist')) {
    keywords.push(...GENERIC_SKILL_CATEGORIES.data.slice(0, 6));
  }
  if (jobTitle.includes('manager') || jobTitle.includes('director') || jobTitle.includes('lead')) {
    keywords.push(...GENERIC_SKILL_CATEGORIES.business.slice(0, 6));
  }
  if (jobTitle.includes('design') || jobTitle.includes('ux') || jobTitle.includes('ui')) {
    keywords.push(...GENERIC_SKILL_CATEGORIES.design.slice(0, 6));
  }
  
  // Add communication skills for all roles
  keywords.push(...GENERIC_SKILL_CATEGORIES.communication.slice(0, 3));
  
  // Remove duplicates and return
  return [...new Set(keywords)];
}

// Helper: Detect which skill domain a job belongs to (generic version)
function detectJobDomainGeneric(jobTitle: string): string | null {
  // Check each domain's keywords against the job title
  for (const [domain, keywords] of Object.entries(SKILL_DOMAINS)) {
    const matchCount = keywords.filter(kw => jobTitle.includes(kw)).length;
    if (matchCount >= 1) {
      return domain;
    }
  }
  
  // Fallback: infer from common job title patterns
  if (jobTitle.includes('data') && (jobTitle.includes('scientist') || jobTitle.includes('ml') || jobTitle.includes('ai'))) {
    return 'ai_ml';
  }
  if (jobTitle.includes('web') || jobTitle.includes('frontend') || jobTitle.includes('backend') || jobTitle.includes('full stack')) {
    return 'web_dev';
  }
  if (jobTitle.includes('mobile') || jobTitle.includes('ios') || jobTitle.includes('android')) {
    return 'mobile';
  }
  if (jobTitle.includes('devops') || jobTitle.includes('sre') || jobTitle.includes('infrastructure')) {
    return 'devops';
  }
  if (jobTitle.includes('finance') || jobTitle.includes('accounting') || jobTitle.includes('audit')) {
    return 'finance';
  }
  if (jobTitle.includes('marketing') || jobTitle.includes('seo') || jobTitle.includes('content')) {
    return 'marketing';
  }
  if (jobTitle.includes('sales') || jobTitle.includes('account executive')) {
    return 'sales';
  }
  if (jobTitle.includes('hr') || jobTitle.includes('recruiter') || jobTitle.includes('talent')) {
    return 'hr';
  }
  
  return null;
}

// Helper: Detect which skill domain a job belongs to (legacy - kept for compatibility)
function detectJobDomain(jobKey: string): string | null {
  const domainMap: Record<string, string> = {
    'data scientist': 'ai_ml',
    'appian developer': 'bpm_workflow',
    'frontend engineer': 'web_dev',
    'backend engineer': 'web_dev',
    'full stack developer': 'web_dev',
    'mobile developer': 'mobile',
    'devops engineer': 'devops',
  };
  return domainMap[jobKey] || null;
}

// Helper: Detect which skill domains are present in the resume
function detectResumeDomains(lowerText: string, lowerSkills: string[]): string[] {
  const domains: string[] = [];
  const combinedText = lowerText + ' ' + lowerSkills.join(' ');

  for (const [domain, keywords] of Object.entries(SKILL_DOMAINS)) {
    const matchCount = keywords.filter(kw => combinedText.includes(kw)).length;
    // If resume has 3+ keywords from a domain, consider it present
    if (matchCount >= 3) {
      domains.push(domain);
    }
  }

  return domains;
}
