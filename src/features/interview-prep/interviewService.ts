import { ResumeData, JobInput } from '@/lib/types';

export interface InterviewPrep {
  technicalQuestions: Array<{
    question: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    sampleAnswer: string;
    tips: string;
  }>;
  behavioralQuestions: Array<{
    question: string;
    starFramework: {
      situation: string;
      task: string;
      action: string;
      result: string;
    };
  }>;
  generalTips: string[];
}

export async function generateInterviewPrep(
  resume: ResumeData,
  jobInput: JobInput
): Promise<InterviewPrep> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const model = process.env.NEXT_PUBLIC_AI_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

  if (!apiKey) {
    return generateFallbackPrep(resume, jobInput);
  }

  const prompt = `Generate interview preparation material for a "${jobInput.jobTitle}" (${jobInput.seniority} level) interview.

CANDIDATE SKILLS: ${resume.skills.slice(0, 12).join(', ')}
EXPERIENCE: ${resume.experience.slice(0, 2).map(e => `${e.title} at ${e.company}`).join('; ')}

Generate:
1. 5 technical questions relevant to ${jobInput.jobTitle}
2. 3 behavioral questions using STAR framework with sample answers based on the candidate's background
3. 3 general interview tips

Respond with ONLY valid JSON:
{
  "technicalQuestions": [
    {"question": "string", "category": "string", "difficulty": "easy|medium|hard", "sampleAnswer": "string", "tips": "string"}
  ],
  "behavioralQuestions": [
    {"question": "string", "starFramework": {"situation": "string", "task": "string", "action": "string", "result": "string"}}
  ],
  "generalTips": ["string"]
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
          { role: 'system', content: 'You are an expert interview coach. Return ONLY valid JSON.' },
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
      technicalQuestions: (parsed.technicalQuestions || []).map((q: any) => ({
        question: q.question || '',
        category: q.category || 'General',
        difficulty: q.difficulty || 'medium',
        sampleAnswer: q.sampleAnswer || '',
        tips: q.tips || '',
      })),
      behavioralQuestions: (parsed.behavioralQuestions || []).map((q: any) => ({
        question: q.question || '',
        starFramework: {
          situation: q.starFramework?.situation || '',
          task: q.starFramework?.task || '',
          action: q.starFramework?.action || '',
          result: q.starFramework?.result || '',
        },
      })),
      generalTips: parsed.generalTips || [],
    };
  } catch {
    return generateFallbackPrep(resume, jobInput);
  }
}

function generateFallbackPrep(resume: ResumeData, jobInput: JobInput): InterviewPrep {
  const title = jobInput.jobTitle;
  const skills = resume.skills.slice(0, 5);
  const latestRole = resume.experience[0];

  return {
    technicalQuestions: [
      {
        question: `Explain your experience with ${skills[0] || 'key technologies'} and how you've applied it in production.`,
        category: 'Technical Skills',
        difficulty: 'medium',
        sampleAnswer: `In my role${latestRole ? ` at ${latestRole.company}` : ''}, I extensively used ${skills[0] || 'modern technologies'} to build and maintain production systems. I focused on writing clean, maintainable code and following best practices.`,
        tips: 'Use specific examples with metrics. Mention scale, complexity, and impact.',
      },
      {
        question: `How would you design a system for ${title.toLowerCase().includes('data') ? 'processing large datasets' : 'handling high traffic'}?`,
        category: 'System Design',
        difficulty: 'hard',
        sampleAnswer: 'I would start by understanding requirements, then design for scalability using distributed systems, caching, and appropriate data structures.',
        tips: 'Draw diagrams if possible. Discuss trade-offs between different approaches.',
      },
      {
        question: `What's a challenging technical problem you've solved recently?`,
        category: 'Problem Solving',
        difficulty: 'medium',
        sampleAnswer: `${latestRole?.bullets[0] || 'I tackled a complex problem that required creative thinking and deep technical knowledge, ultimately delivering a solution that improved performance significantly.'}`,
        tips: 'Structure your answer: Problem → Approach → Solution → Impact.',
      },
      {
        question: `How do you stay current with ${skills.slice(0, 2).join(' and ')} developments?`,
        category: 'Professional Development',
        difficulty: 'easy',
        sampleAnswer: 'I follow industry blogs, contribute to open-source projects, take online courses, and attend meetups to stay updated.',
        tips: 'Mention specific resources, communities, or projects.',
      },
      {
        question: `Describe your experience with ${skills[2] || 'agile methodologies'} in a team setting.`,
        category: 'Collaboration',
        difficulty: 'medium',
        sampleAnswer: 'I have worked in agile environments, participating in sprints, code reviews, and daily standups to deliver features iteratively.',
        tips: 'Emphasize teamwork, communication, and iterative improvement.',
      },
    ],
    behavioralQuestions: [
      {
        question: 'Tell me about a time you had to meet a tight deadline.',
        starFramework: {
          situation: `${latestRole ? `While working at ${latestRole.company}` : 'In a previous role'}, we had an urgent project deadline.`,
          task: 'I needed to deliver a critical feature within a compressed timeline while maintaining quality.',
          action: 'I prioritized tasks, coordinated with team members, and put in focused effort to deliver incrementally.',
          result: 'We delivered on time with high quality, and the project was well-received by stakeholders.',
        },
      },
      {
        question: 'Describe a time you disagreed with a team member. How did you handle it?',
        starFramework: {
          situation: 'During a technical design discussion, I had a different approach than a colleague.',
          task: 'We needed to reach a consensus on the architecture decision.',
          action: 'I listened to their perspective, presented data supporting my approach, and we found a compromise that combined the best of both ideas.',
          result: 'The final solution was stronger than either original proposal, and it strengthened our working relationship.',
        },
      },
      {
        question: 'Tell me about a project you led or took initiative on.',
        starFramework: {
          situation: 'I identified an opportunity to improve our development process.',
          task: 'I proposed and led the initiative to implement the improvement.',
          action: `I researched best practices, created a proof-of-concept using ${skills[0] || 'modern tools'}, and presented it to the team.`,
          result: 'The improvement was adopted and led to measurable gains in productivity and code quality.',
        },
      },
    ],
    generalTips: [
      `Research ${title} roles at the company and understand their tech stack and culture.`,
      'Prepare 2-3 questions to ask your interviewer about team dynamics and growth opportunities.',
      'Practice coding problems on platforms like LeetCode or HackerRank for technical rounds.',
    ],
  };
}
