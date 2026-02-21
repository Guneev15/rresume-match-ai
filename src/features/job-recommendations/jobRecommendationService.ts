import { ResumeData, JobInput } from '@/lib/types';

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
  source: 'linkedin' | 'manual' | 'ai_generated';
}

// Industry-specific job databases for realistic recommendations
const JOB_DATABASE: Record<string, Array<{
  title: string;
  companies: string[];
  locations: string[];
  salaryRange: { min: number; max: number };
  requiredSkills: string[];
  niceToHave: string[];
  descriptions: string[];
}>> = {
  'software': [
    {
      title: 'Full Stack Developer',
      companies: ['Stripe', 'Shopify', 'Atlassian', 'Twilio', 'Vercel'],
      locations: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Remote'],
      salaryRange: { min: 100000, max: 160000 },
      requiredSkills: ['javascript', 'react', 'node.js', 'typescript', 'sql', 'git'],
      niceToHave: ['next.js', 'graphql', 'docker', 'aws'],
      descriptions: ['Build and maintain scalable web applications', 'Develop full-stack features from concept to deployment'],
    },
    {
      title: 'Backend Engineer',
      companies: ['Uber', 'DoorDash', 'Netflix', 'Cloudflare', 'Databricks'],
      locations: ['Seattle, WA', 'San Francisco, CA', 'Remote'],
      salaryRange: { min: 120000, max: 180000 },
      requiredSkills: ['python', 'java', 'sql', 'rest api', 'microservices', 'docker'],
      niceToHave: ['kubernetes', 'kafka', 'redis', 'aws', 'terraform'],
      descriptions: ['Design and build high-performance backend systems', 'Architect scalable microservices infrastructure'],
    },
    {
      title: 'Frontend Engineer',
      companies: ['Figma', 'Canva', 'Notion', 'Linear', 'Webflow'],
      locations: ['Remote', 'New York, NY', 'San Francisco, CA'],
      salaryRange: { min: 95000, max: 150000 },
      requiredSkills: ['javascript', 'react', 'typescript', 'css', 'html'],
      niceToHave: ['next.js', 'vue', 'tailwind', 'figma', 'accessibility'],
      descriptions: ['Build beautiful, performant user interfaces', 'Craft pixel-perfect UI components and design systems'],
    },
    {
      title: 'DevOps Engineer',
      companies: ['HashiCorp', 'Datadog', 'PagerDuty', 'GitLab', 'CircleCI'],
      locations: ['Remote', 'San Francisco, CA', 'Boston, MA'],
      salaryRange: { min: 110000, max: 170000 },
      requiredSkills: ['docker', 'kubernetes', 'ci/cd', 'linux', 'terraform', 'aws'],
      niceToHave: ['ansible', 'jenkins', 'monitoring', 'python', 'bash'],
      descriptions: ['Build and maintain CI/CD pipelines', 'Manage cloud infrastructure and deployment automation'],
    },
  ],
  'data': [
    {
      title: 'Data Scientist',
      companies: ['Meta', 'Spotify', 'Airbnb', 'Tesla', 'Two Sigma'],
      locations: ['New York, NY', 'Menlo Park, CA', 'Remote'],
      salaryRange: { min: 120000, max: 200000 },
      requiredSkills: ['python', 'machine learning', 'sql', 'statistics', 'pandas'],
      niceToHave: ['tensorflow', 'pytorch', 'spark', 'r', 'deep learning'],
      descriptions: ['Apply ML models to solve complex business problems', 'Build predictive models and data-driven solutions'],
    },
    {
      title: 'ML Engineer',
      companies: ['OpenAI', 'Anthropic', 'Google DeepMind', 'NVIDIA', 'Hugging Face'],
      locations: ['San Francisco, CA', 'Remote', 'Seattle, WA'],
      salaryRange: { min: 150000, max: 250000 },
      requiredSkills: ['python', 'pytorch', 'tensorflow', 'machine learning', 'deep learning'],
      niceToHave: ['mlops', 'kubernetes', 'distributed systems', 'nlp', 'computer vision'],
      descriptions: ['Design and deploy production ML systems', 'Develop state-of-the-art machine learning models'],
    },
    {
      title: 'Data Analyst',
      companies: ['Spotify', 'Instacart', 'Robinhood', 'Square', 'Palantir'],
      locations: ['Remote', 'New York, NY', 'Chicago, IL'],
      salaryRange: { min: 75000, max: 120000 },
      requiredSkills: ['sql', 'python', 'excel', 'data visualization', 'statistics'],
      niceToHave: ['tableau', 'power bi', 'r', 'pandas', 'looker'],
      descriptions: ['Transform raw data into actionable business insights', 'Build dashboards and reports for stakeholders'],
    },
    {
      title: 'Data Engineer',
      companies: ['Snowflake', 'Databricks', 'dbt Labs', 'Fivetran', 'Confluent'],
      locations: ['San Francisco, CA', 'Remote', 'Denver, CO'],
      salaryRange: { min: 120000, max: 190000 },
      requiredSkills: ['sql', 'python', 'spark', 'etl', 'data warehousing'],
      niceToHave: ['airflow', 'kafka', 'dbt', 'snowflake', 'aws'],
      descriptions: ['Build robust data pipelines and ETL processes', 'Design and maintain data warehouse architecture'],
    },
  ],
  'design': [
    {
      title: 'UX Designer',
      companies: ['Apple', 'Google', 'Figma', 'InVision', 'Adobe'],
      locations: ['San Francisco, CA', 'Remote', 'Seattle, WA'],
      salaryRange: { min: 90000, max: 150000 },
      requiredSkills: ['figma', 'user research', 'wireframing', 'prototyping', 'usability testing'],
      niceToHave: ['html', 'css', 'design systems', 'accessibility', 'motion design'],
      descriptions: ['Design intuitive user experiences for millions', 'Conduct user research and translate insights into designs'],
    },
    {
      title: 'Product Designer',
      companies: ['Stripe', 'Notion', 'Linear', 'Loom', 'Miro'],
      locations: ['Remote', 'New York, NY', 'San Francisco, CA'],
      salaryRange: { min: 100000, max: 170000 },
      requiredSkills: ['figma', 'product thinking', 'visual design', 'prototyping', 'user research'],
      niceToHave: ['design systems', 'animation', 'front-end', 'data analysis'],
      descriptions: ['Own end-to-end product design from concept to launch', 'Collaborate closely with engineering and product teams'],
    },
  ],
  'management': [
    {
      title: 'Product Manager',
      companies: ['Google', 'Amazon', 'Microsoft', 'Salesforce', 'HubSpot'],
      locations: ['Seattle, WA', 'San Francisco, CA', 'Remote'],
      salaryRange: { min: 120000, max: 200000 },
      requiredSkills: ['product strategy', 'roadmap planning', 'agile', 'data analysis', 'stakeholder management'],
      niceToHave: ['sql', 'a/b testing', 'user research', 'technical background'],
      descriptions: ['Define product vision and drive strategy', 'Lead cross-functional teams to ship impactful features'],
    },
    {
      title: 'Engineering Manager',
      companies: ['Meta', 'Coinbase', 'Lyft', 'Palantir', 'Dropbox'],
      locations: ['Remote', 'New York, NY', 'San Francisco, CA'],
      salaryRange: { min: 150000, max: 250000 },
      requiredSkills: ['leadership', 'software engineering', 'agile', 'team management', 'mentoring'],
      niceToHave: ['system design', 'hiring', 'performance management', 'technical architecture'],
      descriptions: ['Lead and grow high-performing engineering teams', 'Drive technical excellence and team culture'],
    },
  ],
  'marketing': [
    {
      title: 'Digital Marketing Manager',
      companies: ['HubSpot', 'Mailchimp', 'Buffer', 'Semrush', 'Moz'],
      locations: ['Remote', 'Boston, MA', 'San Francisco, CA'],
      salaryRange: { min: 70000, max: 120000 },
      requiredSkills: ['seo', 'content marketing', 'analytics', 'social media', 'email marketing'],
      niceToHave: ['google ads', 'ppc', 'copywriting', 'automation', 'crm'],
      descriptions: ['Develop and execute digital marketing strategies', 'Drive growth through data-driven marketing campaigns'],
    },
    {
      title: 'Growth Marketing Lead',
      companies: ['Notion', 'Figma', 'Canva', 'Loom', 'Calendly'],
      locations: ['Remote', 'San Francisco, CA', 'New York, NY'],
      salaryRange: { min: 90000, max: 150000 },
      requiredSkills: ['growth strategy', 'analytics', 'a/b testing', 'funnel optimization', 'paid acquisition'],
      niceToHave: ['sql', 'python', 'product-led growth', 'lifecycle marketing'],
      descriptions: ['Lead growth initiatives across the full funnel', 'Experiment rapidly to find scalable growth channels'],
    },
  ],
  'finance': [
    {
      title: 'Financial Analyst',
      companies: ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley', 'BlackRock', 'Citadel'],
      locations: ['New York, NY', 'Chicago, IL', 'London'],
      salaryRange: { min: 80000, max: 130000 },
      requiredSkills: ['financial modeling', 'excel', 'data analysis', 'accounting', 'valuation'],
      niceToHave: ['sql', 'python', 'bloomberg terminal', 'vba', 'power bi'],
      descriptions: ['Build financial models and investment analyses', 'Analyze market trends and provide strategic insights'],
    },
  ],
};

/**
 * Determine which job category best matches the user's target role
 */
function categorizeRole(jobTitle: string, skills: string[]): string {
  const lower = jobTitle.toLowerCase();
  const allSkills = skills.map(s => s.toLowerCase()).join(' ');
  
  if (lower.includes('data scien') || lower.includes('ml ') || lower.includes('machine learn') || 
      lower.includes('data analy') || lower.includes('data engineer') || lower.includes('ai ') ||
      allSkills.includes('machine learning') || allSkills.includes('tensorflow') || allSkills.includes('pytorch')) {
    return 'data';
  }
  if (lower.includes('design') || lower.includes('ux') || lower.includes('ui')) {
    return 'design';
  }
  if (lower.includes('product manag') || lower.includes('engineering manag') || lower.includes('project manag') || lower.includes('scrum master')) {
    return 'management';
  }
  if (lower.includes('market') || lower.includes('growth') || lower.includes('seo') || lower.includes('content')) {
    return 'marketing';
  }
  if (lower.includes('financ') || lower.includes('account') || lower.includes('invest')) {
    return 'finance';
  }
  return 'software';
}

/**
 * Calculate match score between resume skills and job requirements
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
  
  // Weight: required skills = 70%, nice-to-have = 30%
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
 * Generate role-specific job recommendations based on the user's target job and resume
 */
export async function generateJobRecommendations(
  resume: ResumeData,
  jobInput: JobInput
): Promise<JobRecommendation[]> {
  const category = categorizeRole(jobInput.jobTitle, resume.skills);
  const jobTemplates = JOB_DATABASE[category] || JOB_DATABASE['software'];
  
  // Generate recommendations from templates
  const recommendations: JobRecommendation[] = [];
  
  jobTemplates.forEach((template, templateIndex) => {
    // Pick a random company and location for variety
    const companyIndex = Math.floor(Math.random() * template.companies.length);
    const locationIndex = Math.floor(Math.random() * template.locations.length);
    
    const { score, matchedSkills, missingSkills } = calculateMatchScore(
      resume.skills,
      template.requiredSkills,
      template.niceToHave
    );
    
    // Adjust title based on seniority
    let adjustedTitle = template.title;
    if (jobInput.seniority === 'senior' && !template.title.startsWith('Senior')) {
      adjustedTitle = `Senior ${template.title}`;
    } else if (jobInput.seniority === 'lead') {
      adjustedTitle = `Lead ${template.title}`;
    } else if (jobInput.seniority === 'junior' || jobInput.seniority === 'entry') {
      adjustedTitle = `Junior ${template.title}`;
    }
    
    // Adjust salary based on seniority
    let salary = { ...template.salaryRange };
    if (jobInput.seniority === 'senior') {
      salary = { min: Math.round(salary.min * 1.3), max: Math.round(salary.max * 1.4) };
    } else if (jobInput.seniority === 'lead') {
      salary = { min: Math.round(salary.min * 1.5), max: Math.round(salary.max * 1.6) };
    } else if (jobInput.seniority === 'junior' || jobInput.seniority === 'entry') {
      salary = { min: Math.round(salary.min * 0.65), max: Math.round(salary.max * 0.75) };
    }
    
    recommendations.push({
      id: `rec-${category}-${templateIndex}`,
      title: adjustedTitle,
      company: template.companies[companyIndex],
      location: template.locations[locationIndex],
      remote: template.locations[locationIndex] === 'Remote',
      salary,
      matchScore: score,
      matchedSkills,
      missingSkills,
      description: template.descriptions[Math.floor(Math.random() * template.descriptions.length)],
      source: 'manual',
    });
  });
  
  // Also add a job matching the exact title the user typed
  const exactJobMatch: JobRecommendation = {
    id: 'rec-exact-match',
    title: jobInput.jobTitle,
    company: 'Various Companies',
    location: 'Remote / On-site',
    remote: true,
    matchScore: Math.min(95, Math.max(40, Math.round(resume.skills.length * 5))),
    matchedSkills: resume.skills.slice(0, 6),
    missingSkills: [],
    description: `Looking for a ${jobInput.jobTitle} who can bring expertise and drive impactful results. This role matches your profile based on your skills and experience.`,
    source: 'manual',
  };
  
  recommendations.unshift(exactJobMatch);
  
  // Sort by match score
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  
  return recommendations;
}

/**
 * Generate AI-powered job recommendations using OpenRouter
 */
export async function generateAIJobRecommendations(
  resume: ResumeData,
  jobInput: JobInput,
  apiKey: string,
  model: string
): Promise<JobRecommendation[]> {
  const prompt = `You are a career advisor. Based on this resume and target role, suggest 5 highly relevant and SPECIFIC job positions that would be a good match.

TARGET ROLE: ${jobInput.jobTitle}
SENIORITY: ${jobInput.seniority}
${jobInput.industry ? `INDUSTRY: ${jobInput.industry}` : ''}

RESUME SKILLS: ${resume.skills.join(', ')}
EXPERIENCE: ${resume.experience.map(e => `${e.title} at ${e.company} (${e.duration})`).join('; ')}
EDUCATION: ${resume.education.map(e => `${e.degree} from ${e.institution}`).join(', ')}

IMPORTANT: The recommendations MUST be directly relevant to "${jobInput.jobTitle}" — not generic. Each job should be a realistic position the candidate could apply for.

For each job, provide:
1. A specific job title closely related to "${jobInput.jobTitle}"
2. A real company name that hires for this role
3. Match score (0-100) based on how well the resume fits
4. Matched skills from the resume
5. Missing skills that would improve candidacy
6. A brief compelling job description

Respond with ONLY valid JSON array, no additional text:
[
  {
    "title": "string",
    "company": "string",
    "location": "string",
    "remote": true/false,
    "matchScore": number,
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
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI recommendations');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
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
      source: 'ai_generated' as const,
    }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('AI job recommendations failed, using fallback:', error);
    }
    return [];
  }
}
