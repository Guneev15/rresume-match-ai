import { ResumeData, JobInput } from '@/lib/types';

export interface ApplyLink {
  platform: 'linkedin' | 'indeed' | 'glassdoor' | 'google';
  url: string;
  label: string;
}

export interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salary?: { min: number; max: number };
  matchScore: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  description: string;
  url?: string;
  applyLinks: ApplyLink[];
  source: 'linkedin' | 'manual' | 'ai_generated';
  postedDate?: string;
}

// ─── Helpers ────────────────────────────────────────

/** Build real-time job search URLs for a given title */
function buildApplyLinks(title: string, location?: string): ApplyLink[] {
  const q = encodeURIComponent(title);
  const loc = location && location !== 'Remote' ? `&location=${encodeURIComponent(location)}` : '';

  return [
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      // f_TPR=r604800 → posted in last 7 days
      url: `https://www.linkedin.com/jobs/search/?keywords=${q}${loc}&f_TPR=r604800`,
    },
    {
      platform: 'indeed',
      label: 'Indeed',
      // fromage=7 → last 7 days
      url: `https://www.indeed.com/jobs?q=${q}${loc.replace('location', 'l')}&fromage=7`,
    },
    {
      platform: 'glassdoor',
      label: 'Glassdoor',
      url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q}`,
    },
    {
      platform: 'google',
      label: 'Google Jobs',
      // chips=date_posted:week → past week
      url: `https://www.google.com/search?q=${q}+jobs&ibp=htl;jobs&chips=date_posted:week`,
    },
  ];
}

/**
 * Generate role-specific related titles based on the exact job the user typed.
 * E.g. "Data Scientist" → "Senior Data Scientist", "Applied ML Scientist", etc.
 */
function generateRelatedTitles(
  baseTitle: string,
  seniority: string
): string[] {
  const lower = baseTitle.toLowerCase();
  const titles: string[] = [];

  // Always include the exact title the user typed
  titles.push(baseTitle);

  // Seniority variants
  if (seniority !== 'senior') {
    titles.push(`Senior ${baseTitle}`);
  }
  titles.push(`Lead ${baseTitle}`);
  if (seniority === 'senior') {
    titles.push(`Staff ${baseTitle}`);
    titles.push(`Principal ${baseTitle}`);
  }

  // Domain-specific related titles
  if (lower.includes('data scientist')) {
    titles.push('Applied ML Scientist', 'Research Data Scientist', 'AI/ML Data Scientist');
  } else if (lower.includes('data analyst')) {
    titles.push('Business Intelligence Analyst', 'Analytics Engineer', 'Product Analyst');
  } else if (lower.includes('data engineer')) {
    titles.push('Analytics Engineer', 'Big Data Engineer', 'Data Platform Engineer');
  } else if (lower.includes('ml engineer') || lower.includes('machine learning')) {
    titles.push('AI Engineer', 'Deep Learning Engineer', 'MLOps Engineer');
  } else if (lower.includes('frontend') || lower.includes('front end') || lower.includes('front-end')) {
    titles.push('UI Developer', 'React Developer', 'Web Developer');
  } else if (lower.includes('backend') || lower.includes('back end') || lower.includes('back-end')) {
    titles.push('API Developer', 'Platform Engineer', 'Server-Side Engineer');
  } else if (lower.includes('full stack') || lower.includes('fullstack')) {
    titles.push('Software Engineer', 'Web Application Developer', 'Full Stack Web Developer');
  } else if (lower.includes('devops')) {
    titles.push('Site Reliability Engineer', 'Cloud Engineer', 'Platform Engineer');
  } else if (lower.includes('product manager')) {
    titles.push('Technical Product Manager', 'Product Owner', 'Associate Product Manager');
  } else if (lower.includes('ux') || lower.includes('ui') || lower.includes('designer')) {
    titles.push('Product Designer', 'Interaction Designer', 'Visual Designer');
  } else if (lower.includes('software engineer') || lower.includes('software developer')) {
    titles.push('Application Developer', 'Systems Engineer', 'Platform Engineer');
  } else if (lower.includes('project manager')) {
    titles.push('Scrum Master', 'Program Manager', 'Delivery Manager');
  } else if (lower.includes('market')) {
    titles.push('Growth Marketing Manager', 'Performance Marketer', 'Digital Strategist');
  } else if (lower.includes('financ') || lower.includes('account')) {
    titles.push('Financial Analyst', 'Business Analyst', 'Investment Analyst');
  } else if (lower.includes('cyber') || lower.includes('security')) {
    titles.push('Security Engineer', 'InfoSec Analyst', 'Penetration Tester');
  } else if (lower.includes('qa') || lower.includes('test') || lower.includes('quality')) {
    titles.push('QA Engineer', 'SDET', 'Automation Test Engineer');
  } else if (lower.includes('mobile') || lower.includes('android') || lower.includes('ios')) {
    titles.push('Mobile App Developer', 'React Native Developer', 'Flutter Developer');
  } else if (lower.includes('cloud') || lower.includes('aws') || lower.includes('azure')) {
    titles.push('Cloud Solutions Architect', 'Cloud Infrastructure Engineer', 'AWS Engineer');
  } else {
    // Generic fallback: add common variants
    titles.push(`${baseTitle} II`, `Associate ${baseTitle}`);
  }

  // Deduplicate and return max 6
  return [...new Set(titles)].slice(0, 6);
}

// Companies database per domain (for realistic-looking recs)
const COMPANY_POOLS: Record<string, string[]> = {
  tech: ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Uber', 'Stripe', 'Shopify', 'Atlassian', 'Twilio', 'Vercel', 'Cloudflare', 'Databricks', 'Snowflake'],
  data: ['OpenAI', 'Anthropic', 'Databricks', 'Snowflake', 'Palantir', 'Two Sigma', 'Meta', 'Spotify', 'Airbnb', 'Tesla', 'NVIDIA', 'Hugging Face', 'Scale AI', 'Weights & Biases'],
  design: ['Figma', 'Canva', 'Notion', 'Linear', 'Webflow', 'InVision', 'Miro', 'Loom', 'Apple', 'Google'],
  management: ['Google', 'Amazon', 'Microsoft', 'Salesforce', 'HubSpot', 'Coinbase', 'Lyft', 'Dropbox', 'Slack', 'Asana'],
  marketing: ['HubSpot', 'Mailchimp', 'Buffer', 'Semrush', 'Notion', 'Canva', 'Calendly', 'Loom', 'Moz'],
  finance: ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley', 'BlackRock', 'Citadel', 'Stripe', 'Square', 'Robinhood', 'Plaid'],
  security: ['CrowdStrike', 'Palo Alto Networks', 'Fortinet', 'SentinelOne', 'Cloudflare', 'Okta', 'Zscaler'],
  devops: ['HashiCorp', 'Datadog', 'PagerDuty', 'GitLab', 'CircleCI', 'Docker', 'Vercel', 'Cloudflare'],
  mobile: ['Meta', 'Google', 'Apple', 'Uber', 'DoorDash', 'Spotify', 'Snapchat', 'TikTok'],
  general: ['Google', 'Microsoft', 'Amazon', 'Salesforce', 'Adobe', 'IBM', 'Oracle', 'SAP', 'Cisco', 'VMware'],
};

const LOCATIONS = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote', 'Boston, MA', 'Chicago, IL', 'Denver, CO', 'Los Angeles, CA', 'London, UK'];

/** Determine company pool key */
function getCompanyPool(jobTitle: string): string {
  const lower = jobTitle.toLowerCase();
  if (lower.includes('data') || lower.includes('ml') || lower.includes('machine learn') || lower.includes('ai'))
    return 'data';
  if (lower.includes('design') || lower.includes('ux') || lower.includes('ui'))
    return 'design';
  if (lower.includes('product manag') || lower.includes('engineering manag') || lower.includes('project manag') || lower.includes('scrum'))
    return 'management';
  if (lower.includes('market') || lower.includes('growth') || lower.includes('seo'))
    return 'marketing';
  if (lower.includes('financ') || lower.includes('account') || lower.includes('invest'))
    return 'finance';
  if (lower.includes('security') || lower.includes('cyber') || lower.includes('infosec'))
    return 'security';
  if (lower.includes('devops') || lower.includes('sre') || lower.includes('platform') || lower.includes('infrastructure'))
    return 'devops';
  if (lower.includes('mobile') || lower.includes('android') || lower.includes('ios') || lower.includes('flutter'))
    return 'mobile';
  if (lower.includes('frontend') || lower.includes('backend') || lower.includes('software') || lower.includes('full stack') || lower.includes('developer') || lower.includes('engineer'))
    return 'tech';
  return 'general';
}

/** Compute a pseudo-random but deterministic pick from an array */
function pickRandom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

/**
 * Calculate match score between resume skills and a job title / required skills
 */
function calculateMatchScore(
  resumeSkills: string[],
  requiredSkills: string[],
  niceToHave: string[]
): { score: number; matchedSkills: string[]; missingSkills: string[] } {
  const lowerResumeSkills = resumeSkills.map(s => s.toLowerCase());

  const matchedRequired = requiredSkills.filter(skill =>
    lowerResumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))
  );

  const matchedNice = niceToHave.filter(skill =>
    lowerResumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))
  );

  const missingSkills = requiredSkills.filter(skill => !matchedRequired.includes(skill));

  const requiredRatio = requiredSkills.length > 0 ? matchedRequired.length / requiredSkills.length : 0.5;
  const niceRatio = niceToHave.length > 0 ? matchedNice.length / niceToHave.length : 0.3;
  const score = Math.round((requiredRatio * 70) + (niceRatio * 30));

  return {
    score: Math.max(15, Math.min(98, score)),
    matchedSkills: [...matchedRequired, ...matchedNice],
    missingSkills,
  };
}

/**
 * Infer likely required skills from a job title
 */
function inferSkillsForTitle(title: string): { required: string[]; niceToHave: string[] } {
  const lower = title.toLowerCase();

  if (lower.includes('data scientist') || lower.includes('ml scientist')) {
    return { required: ['python', 'machine learning', 'sql', 'statistics', 'pandas'], niceToHave: ['tensorflow', 'pytorch', 'deep learning', 'spark', 'r'] };
  }
  if (lower.includes('data analyst') || lower.includes('business intelligence') || lower.includes('product analyst')) {
    return { required: ['sql', 'python', 'excel', 'data visualization', 'statistics'], niceToHave: ['tableau', 'power bi', 'looker', 'pandas'] };
  }
  if (lower.includes('data engineer') || lower.includes('analytics engineer')) {
    return { required: ['sql', 'python', 'etl', 'data warehousing', 'spark'], niceToHave: ['airflow', 'dbt', 'kafka', 'snowflake', 'aws'] };
  }
  if (lower.includes('ml engineer') || lower.includes('ai engineer') || lower.includes('deep learning')) {
    return { required: ['python', 'pytorch', 'tensorflow', 'machine learning', 'mlops'], niceToHave: ['kubernetes', 'docker', 'distributed systems', 'nlp'] };
  }
  if (lower.includes('frontend') || lower.includes('react') || lower.includes('ui developer')) {
    return { required: ['javascript', 'react', 'typescript', 'css', 'html'], niceToHave: ['next.js', 'vue', 'tailwind', 'figma', 'testing'] };
  }
  if (lower.includes('backend') || lower.includes('api developer') || lower.includes('server')) {
    return { required: ['python', 'java', 'sql', 'rest api', 'microservices'], niceToHave: ['docker', 'kubernetes', 'aws', 'redis', 'kafka'] };
  }
  if (lower.includes('full stack') || lower.includes('software engineer') || lower.includes('software developer')) {
    return { required: ['javascript', 'react', 'node.js', 'sql', 'git'], niceToHave: ['typescript', 'docker', 'aws', 'graphql', 'next.js'] };
  }
  if (lower.includes('devops') || lower.includes('sre') || lower.includes('platform engineer')) {
    return { required: ['docker', 'kubernetes', 'ci/cd', 'linux', 'terraform'], niceToHave: ['aws', 'ansible', 'monitoring', 'python'] };
  }
  if (lower.includes('product manager')) {
    return { required: ['product strategy', 'roadmap planning', 'agile', 'data analysis', 'stakeholder management'], niceToHave: ['sql', 'a/b testing', 'user research'] };
  }
  if (lower.includes('design') || lower.includes('ux') || lower.includes('ui')) {
    return { required: ['figma', 'user research', 'wireframing', 'prototyping', 'visual design'], niceToHave: ['html', 'css', 'design systems', 'accessibility'] };
  }
  if (lower.includes('security') || lower.includes('cyber')) {
    return { required: ['network security', 'penetration testing', 'siem', 'firewalls', 'incident response'], niceToHave: ['python', 'cloud security', 'compliance'] };
  }
  if (lower.includes('mobile') || lower.includes('android') || lower.includes('ios')) {
    return { required: ['mobile development', 'react native', 'swift', 'kotlin', 'rest api'], niceToHave: ['flutter', 'firebase', 'ci/cd', 'testing'] };
  }
  if (lower.includes('project manager') || lower.includes('scrum') || lower.includes('delivery')) {
    return { required: ['project management', 'agile', 'scrum', 'stakeholder management', 'jira'], niceToHave: ['risk management', 'budgeting', 'confluence', 'pmp'] };
  }
  if (lower.includes('market')) {
    return { required: ['seo', 'content marketing', 'analytics', 'social media', 'email marketing'], niceToHave: ['google ads', 'ppc', 'automation', 'crm'] };
  }
  if (lower.includes('financ') || lower.includes('account')) {
    return { required: ['financial modeling', 'excel', 'data analysis', 'accounting', 'valuation'], niceToHave: ['sql', 'python', 'power bi', 'bloomberg'] };
  }

  // Generic fallback — use resume skills as required
  return { required: [], niceToHave: [] };
}

// Base salary ranges per domain
const SALARY_RANGES: Record<string, { min: number; max: number }> = {
  data: { min: 110000, max: 190000 },
  tech: { min: 100000, max: 170000 },
  design: { min: 90000, max: 150000 },
  management: { min: 120000, max: 200000 },
  marketing: { min: 70000, max: 130000 },
  finance: { min: 85000, max: 150000 },
  security: { min: 100000, max: 160000 },
  devops: { min: 110000, max: 175000 },
  mobile: { min: 100000, max: 165000 },
  general: { min: 80000, max: 140000 },
};

// ─── Main generator ─────────────────────────────────

/**
 * Generate role-specific job recommendations based on the user's exact target job title
 */
export async function generateJobRecommendations(
  resume: ResumeData,
  jobInput: JobInput
): Promise<JobRecommendation[]> {
  const relatedTitles = generateRelatedTitles(jobInput.jobTitle, jobInput.seniority);
  const pool = getCompanyPool(jobInput.jobTitle);
  const companies = COMPANY_POOLS[pool] || COMPANY_POOLS['general'];
  const baseSalary = SALARY_RANGES[pool] || SALARY_RANGES['general'];

  // Today's date for "posted" field
  const now = new Date();
  const daysAgoOptions = [0, 1, 2, 3, 5, 6]; // only recent postings

  const recommendations: JobRecommendation[] = relatedTitles.map((title, i) => {
    const company = pickRandom(companies, i * 7 + title.length);
    const location = pickRandom(LOCATIONS, i * 3 + title.charCodeAt(0));
    const isRemote = location === 'Remote' || i % 3 === 0;

    // Infer skills for this title
    const { required, niceToHave } = inferSkillsForTitle(title);
    const useResume = required.length === 0;
    const effectiveRequired = useResume ? resume.skills.slice(0, 6).map(s => s.toLowerCase()) : required;
    const effectiveNice = useResume ? resume.skills.slice(6, 10).map(s => s.toLowerCase()) : niceToHave;

    const { score, matchedSkills, missingSkills } = calculateMatchScore(
      resume.skills,
      effectiveRequired,
      effectiveNice
    );

    // Adjust salary by seniority
    let salary = { ...baseSalary };
    if (jobInput.seniority === 'senior' || title.includes('Senior') || title.includes('Staff')) {
      salary = { min: Math.round(salary.min * 1.3), max: Math.round(salary.max * 1.4) };
    } else if (title.includes('Lead') || title.includes('Principal')) {
      salary = { min: Math.round(salary.min * 1.5), max: Math.round(salary.max * 1.6) };
    } else if (jobInput.seniority === 'junior') {
      salary = { min: Math.round(salary.min * 0.65), max: Math.round(salary.max * 0.75) };
    }

    // Posted date (recent)
    const daysAgo = daysAgoOptions[i % daysAgoOptions.length];
    const posted = new Date(now);
    posted.setDate(posted.getDate() - daysAgo);
    const postedLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

    // Build apply links for this specific title
    const applyLinks = buildApplyLinks(title, location);

    return {
      id: `rec-${i}-${Date.now()}`,
      title,
      company,
      location: isRemote ? 'Remote' : location,
      remote: isRemote,
      salary,
      matchScore: score,
      matchedSkills,
      missingSkills,
      description: `Looking for a ${title} to join ${company}. This role focuses on leveraging ${effectiveRequired.slice(0, 3).join(', ')} to drive impactful results. ${isRemote ? 'Fully remote position available.' : `Based in ${location}.`}`,
      url: applyLinks[0]?.url, // Primary link = LinkedIn
      applyLinks,
      source: 'manual' as const,
      postedDate: postedLabel,
    };
  });

  // Sort by match score (highest first)
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  return recommendations;
}

/**
 * Generate AI-powered role-specific job recommendations using OpenRouter
 */
export async function generateAIJobRecommendations(
  resume: ResumeData,
  jobInput: JobInput,
  apiKey: string,
  model: string
): Promise<JobRecommendation[]> {
  const prompt = `You are a career advisor. Based on this resume and target role, suggest 5 highly relevant and SPECIFIC job positions.

TARGET ROLE: ${jobInput.jobTitle}
SENIORITY: ${jobInput.seniority}
${jobInput.industry ? `INDUSTRY: ${jobInput.industry}` : ''}

RESUME SKILLS: ${resume.skills.join(', ')}
EXPERIENCE: ${resume.experience.map(e => `${e.title} at ${e.company} (${e.startDate} - ${e.endDate})`).join('; ')}

IMPORTANT RULES:
1. Each job title MUST be closely related to "${jobInput.jobTitle}" — NOT generic
2. Use REAL company names that actively hire for "${jobInput.jobTitle}"
3. Each title should be a realistic variation (e.g. Senior, Staff, Applied, Research, etc.)
4. Do NOT repeat the same title

Respond with ONLY valid JSON array:
[
  {
    "title": "string (close variant of ${jobInput.jobTitle})",
    "company": "string (real company)",
    "location": "string",
    "remote": true/false,
    "matchScore": number (0-100),
    "matchedSkills": ["string"],
    "missingSkills": ["string"],
    "description": "string",
    "salaryMin": number,
    "salaryMax": number
  }
]`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI recommendations');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const aiJobs = JSON.parse(jsonMatch[0]);

    return aiJobs.map((job: any, index: number) => ({
      id: `ai-${index}-${Date.now()}`,
      title: job.title,
      company: job.company,
      location: job.location || 'Remote',
      remote: job.remote ?? true,
      salary: job.salaryMin && job.salaryMax ? { min: job.salaryMin, max: job.salaryMax } : undefined,
      matchScore: Math.max(10, Math.min(100, job.matchScore || 50)),
      matchedSkills: job.matchedSkills || [],
      missingSkills: job.missingSkills || [],
      description: job.description,
      applyLinks: buildApplyLinks(job.title, job.location),
      url: buildApplyLinks(job.title)[0]?.url,
      source: 'ai_generated' as const,
      postedDate: 'Recent',
    }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('AI job recommendations failed, using fallback:', error);
    }
    return [];
  }
}
