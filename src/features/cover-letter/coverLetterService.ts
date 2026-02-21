import { ResumeData, JobInput } from '@/lib/types';

export interface CoverLetter {
  greeting: string;
  opening: string;
  body: string[];
  closing: string;
  signature: string;
  metadata: {
    jobTitle: string;
    company: string;
    tone: 'professional' | 'enthusiastic' | 'formal';
  };
}

export async function generateCoverLetter(
  resume: ResumeData,
  jobInput: JobInput,
  company: string,
  tone: 'professional' | 'enthusiastic' | 'formal' = 'professional'
): Promise<CoverLetter> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const model = process.env.NEXT_PUBLIC_AI_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

  if (!apiKey) {
    return generateFallbackCoverLetter(resume, jobInput, company, tone);
  }

  const toneInstructions = {
    professional: 'Use a professional, confident tone. Be concise and results-oriented.',
    enthusiastic: 'Use an enthusiastic, passionate tone. Show genuine excitement about the opportunity.',
    formal: 'Use a formal, traditional business tone. Be respectful and conventional.',
  };

  const prompt = `Generate a compelling cover letter for this candidate applying to "${company}" for a "${jobInput.jobTitle}" position.

CANDIDATE BACKGROUND:
- Name: ${resume.name || 'Candidate'}
- Skills: ${resume.skills.slice(0, 10).join(', ')}
- Experience: ${resume.experience.slice(0, 3).map(e => `${e.title} at ${e.company}`).join('; ')}
- Education: ${resume.education.map(e => `${e.degree} from ${e.institution}`).join('; ')}
- Key Achievements: ${resume.achievements?.slice(0, 3).join('; ') || 'Various impactful projects'}

TONE: ${toneInstructions[tone]}

Respond with ONLY valid JSON:
{
  "greeting": "Dear Hiring Manager,",
  "opening": "<compelling opening paragraph - 2-3 sentences showing why you're excited and qualified>",
  "body": ["<paragraph about relevant experience and skills - 3-4 sentences>", "<paragraph about specific value you'd bring - 2-3 sentences>"],
  "closing": "<strong closing paragraph with call to action - 2 sentences>",
  "signature": "Sincerely,\\n${resume.name || 'Candidate'}"
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
          { role: 'system', content: 'You are an expert career coach who writes compelling cover letters. Return ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
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
      greeting: parsed.greeting || 'Dear Hiring Manager,',
      opening: parsed.opening || '',
      body: Array.isArray(parsed.body) ? parsed.body : [parsed.body || ''],
      closing: parsed.closing || '',
      signature: parsed.signature || `Sincerely,\n${resume.name || 'Candidate'}`,
      metadata: { jobTitle: jobInput.jobTitle, company, tone },
    };
  } catch {
    return generateFallbackCoverLetter(resume, jobInput, company, tone);
  }
}

function generateFallbackCoverLetter(
  resume: ResumeData,
  jobInput: JobInput,
  company: string,
  tone: 'professional' | 'enthusiastic' | 'formal'
): CoverLetter {
  const name = resume.name || 'Candidate';
  const topSkills = resume.skills.slice(0, 5).join(', ');
  const latestRole = resume.experience[0];
  
  const openings = {
    professional: `I am writing to express my strong interest in the ${jobInput.jobTitle} position at ${company}. With expertise in ${topSkills}, I am confident in my ability to make meaningful contributions to your team.`,
    enthusiastic: `I am thrilled to apply for the ${jobInput.jobTitle} role at ${company}! As a passionate professional with deep expertise in ${topSkills}, I believe this opportunity is a perfect match for my skills and ambitions.`,
    formal: `I wish to formally express my interest in the ${jobInput.jobTitle} position at ${company}. My professional background in ${topSkills} aligns well with the requirements of this role.`,
  };

  const bodyParagraphs = [];
  
  if (latestRole) {
    bodyParagraphs.push(
      `In my role as ${latestRole.title} at ${latestRole.company}, I developed strong capabilities in ${topSkills}. ${latestRole.bullets[0] || 'I consistently delivered high-quality results and contributed to team success.'}`
    );
  }

  bodyParagraphs.push(
    `I bring a unique combination of technical skills and analytical thinking that will enable me to contribute effectively from day one. My experience with ${resume.skills.slice(0, 3).join(', ')} positions me well to tackle the challenges of this role and drive meaningful outcomes.`
  );

  const closings = {
    professional: `I welcome the opportunity to discuss how my background and skills can contribute to ${company}'s continued success. I look forward to speaking with you.`,
    enthusiastic: `I would love the chance to share more about how my passion and skills align with your team's goals at ${company}. I am eager to discuss this exciting opportunity!`,
    formal: `I would appreciate the opportunity to discuss my qualifications in greater detail. Thank you for considering my application.`,
  };

  return {
    greeting: 'Dear Hiring Manager,',
    opening: openings[tone],
    body: bodyParagraphs,
    closing: closings[tone],
    signature: `Sincerely,\n${name}`,
    metadata: { jobTitle: jobInput.jobTitle, company, tone },
  };
}
