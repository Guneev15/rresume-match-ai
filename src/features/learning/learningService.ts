import { ResumeData, JobInput } from '@/lib/types';

export interface LearningRoadmap {
  missingSkills: Array<{
    skill: string;
    priority: 'critical' | 'high' | 'medium';
    resources: Array<{
      type: 'course' | 'book' | 'project' | 'certification';
      title: string;
      provider: string;
      url: string;
      duration: string;
      free: boolean;
    }>;
    milestones: string[];
    estimatedWeeks: number;
  }>;
  timeline: {
    totalWeeks: number;
    hoursPerWeek: number;
  };
  summary: string;
}

export async function generateLearningRoadmap(
  resume: ResumeData,
  jobInput: JobInput
): Promise<LearningRoadmap> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const model = process.env.NEXT_PUBLIC_AI_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

  if (!apiKey) {
    return generateFallbackRoadmap(resume, jobInput);
  }

  const prompt = `Create a personalized learning roadmap for someone transitioning to "${jobInput.jobTitle}" (${jobInput.seniority} level).

CURRENT SKILLS: ${resume.skills.join(', ')}
EXPERIENCE: ${resume.experience.slice(0, 2).map(e => `${e.title} at ${e.company}`).join('; ')}

Identify skills gaps and provide a structured learning plan with real, specific resources (courses, books, projects).

Respond with ONLY valid JSON:
{
  "missingSkills": [
    {
      "skill": "string",
      "priority": "critical|high|medium",
      "resources": [
        {"type": "course|book|project|certification", "title": "string", "provider": "string", "url": "https://...", "duration": "string", "free": true/false}
      ],
      "milestones": ["string"],
      "estimatedWeeks": number
    }
  ],
  "timeline": {"totalWeeks": number, "hoursPerWeek": 10},
  "summary": "string"
}`;

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
        messages: [
          { role: 'system', content: 'You are a career learning advisor. Return ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) throw new Error('AI request failed');

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      else throw new Error('Invalid response');
    }

    return {
      missingSkills: (parsed.missingSkills || []).map((s: any) => ({
        skill: s.skill || '',
        priority: s.priority || 'medium',
        resources: (s.resources || []).map((r: any) => ({
          type: r.type || 'course',
          title: r.title || '',
          provider: r.provider || '',
          url: r.url || '#',
          duration: r.duration || '',
          free: r.free ?? true,
        })),
        milestones: s.milestones || [],
        estimatedWeeks: s.estimatedWeeks || 4,
      })),
      timeline: {
        totalWeeks: parsed.timeline?.totalWeeks || 12,
        hoursPerWeek: parsed.timeline?.hoursPerWeek || 10,
      },
      summary: parsed.summary || '',
    };
  } catch {
    return generateFallbackRoadmap(resume, jobInput);
  }
}

function generateFallbackRoadmap(resume: ResumeData, jobInput: JobInput): LearningRoadmap {
  const title = jobInput.jobTitle.toLowerCase();
  const existingSkills = resume.skills.map(s => s.toLowerCase());
  
  // Define skill requirements for common roles
  const roleSkills: Record<string, Array<{ skill: string; resources: any[]; priority: 'critical' | 'high' | 'medium' }>> = {
    'default': [
      { skill: 'System Design', priority: 'high', resources: [
        { type: 'course', title: 'System Design Interview', provider: 'Educative', url: 'https://educative.io/courses/grokking-modern-system-design', duration: '40 hours', free: false },
        { type: 'book', title: 'Designing Data-Intensive Applications', provider: 'O\'Reilly', url: 'https://dataintensive.net/', duration: '4 weeks', free: false },
      ]},
      { skill: 'Cloud Services (AWS/GCP)', priority: 'high', resources: [
        { type: 'course', title: 'AWS Cloud Practitioner', provider: 'AWS', url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/', duration: '20 hours', free: true },
        { type: 'certification', title: 'AWS Solutions Architect', provider: 'AWS', url: 'https://aws.amazon.com/certification/', duration: '8 weeks', free: false },
      ]},
      { skill: 'Docker & Kubernetes', priority: 'medium', resources: [
        { type: 'course', title: 'Docker Mastery', provider: 'Udemy', url: 'https://www.udemy.com/course/docker-mastery/', duration: '20 hours', free: false },
        { type: 'project', title: 'Containerize a full-stack app', provider: 'Self-guided', url: 'https://docs.docker.com/get-started/', duration: '1 week', free: true },
      ]},
    ],
    'data': [
      { skill: 'Machine Learning', priority: 'critical', resources: [
        { type: 'course', title: 'Machine Learning Specialization', provider: 'Coursera (Andrew Ng)', url: 'https://www.coursera.org/specializations/machine-learning-introduction', duration: '3 months', free: true },
        { type: 'course', title: 'Fast.ai Practical Deep Learning', provider: 'fast.ai', url: 'https://course.fast.ai/', duration: '7 weeks', free: true },
      ]},
      { skill: 'SQL & Data Modeling', priority: 'high', resources: [
        { type: 'course', title: 'SQL for Data Science', provider: 'Coursera', url: 'https://www.coursera.org/learn/sql-for-data-science', duration: '16 hours', free: true },
        { type: 'project', title: 'Build an analytics dashboard', provider: 'Self-guided', url: 'https://mode.com/sql-tutorial/', duration: '2 weeks', free: true },
      ]},
      { skill: 'Python Data Stack', priority: 'critical', resources: [
        { type: 'course', title: 'Python for Data Science', provider: 'DataCamp', url: 'https://www.datacamp.com/tracks/data-scientist-with-python', duration: '80 hours', free: false },
        { type: 'book', title: 'Hands-On ML with Scikit-Learn', provider: 'O\'Reilly', url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/', duration: '6 weeks', free: false },
      ]},
    ],
    'frontend': [
      { skill: 'React & Next.js', priority: 'critical', resources: [
        { type: 'course', title: 'React - The Complete Guide', provider: 'Udemy', url: 'https://www.udemy.com/course/react-the-complete-guide/', duration: '48 hours', free: false },
        { type: 'course', title: 'Next.js Documentation', provider: 'Vercel', url: 'https://nextjs.org/learn', duration: '16 hours', free: true },
      ]},
      { skill: 'TypeScript', priority: 'high', resources: [
        { type: 'course', title: 'TypeScript Deep Dive', provider: 'basarat', url: 'https://basarat.gitbook.io/typescript/', duration: '20 hours', free: true },
      ]},
    ],
  };

  // Determine category
  let category = 'default';
  if (title.includes('data') || title.includes('ml') || title.includes('machine')) category = 'data';
  else if (title.includes('frontend') || title.includes('ui') || title.includes('react')) category = 'frontend';

  const skills = roleSkills[category] || roleSkills['default'];
  const missingSkills = skills
    .filter(s => !existingSkills.some(es => es.includes(s.skill.toLowerCase().split(' ')[0])))
    .map(s => ({
      ...s,
      milestones: [`Complete introductory ${s.skill} course`, `Build a project using ${s.skill}`, `Apply ${s.skill} in a real scenario`],
      estimatedWeeks: s.priority === 'critical' ? 6 : s.priority === 'high' ? 4 : 3,
    }));

  return {
    missingSkills,
    timeline: {
      totalWeeks: missingSkills.reduce((sum, s) => sum + s.estimatedWeeks, 0),
      hoursPerWeek: 10,
    },
    summary: `Based on your current skills and target role as ${jobInput.jobTitle}, we've identified ${missingSkills.length} key areas to strengthen. Focus on critical priorities first for the fastest path to readiness.`,
  };
}
