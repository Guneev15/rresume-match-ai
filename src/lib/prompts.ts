import { JobInput } from './types';

export function buildAnalysisPrompt(resumeText: string, job: JobInput): string {
  return `Analyze this resume against the target job. Return structured JSON.

TARGET: ${job.jobTitle} | ${job.seniority} | ${job.industry || 'General'}

RESUME:
${resumeText}

SCORING: Skills match (50%), Experience (25%), ATS (10%), Achievements (5%), Education (10%).
Apply heavy penalties for domain mismatch (15-30 score). Good fit = 70-85. Excellent = 85+.

Return ONLY valid JSON:
{
  "overallScore": <0-100>,
  "summary": "<3 sentence career-coach style summary, honest about fit>",
  "sectionScores": {
    "skillsMatch": <0-100>,
    "experienceMatch": <0-100>,
    "education": <0-100>,
    "atsReadability": <0-100>,
    "achievementQuality": <0-100>
  },
  "topActions": [
    {"priority": 1, "text": "<action 6-14 words>", "why": "<evidence>"}
  ],
  "rewrites": [
    {"original": "<bullet from resume>", "improved": "<better version>", "toneVariants": {"technical": "", "product": "", "leadership": ""}}
  ],
  "keywordsToAdd": ["keyword1", "keyword2"],
  "atsChecklist": [{"item": "<check>", "passed": true}],
  "explainability": {
    "skillMatches": [{"skill": "<skill>", "evidence": ["<excerpt>"]}],
    "scoreBreakdown": "<how score was computed>"
  }
}

Give 5 actions, 3 rewrites, 5-8 keywords, 5 ATS checks.`;
}
