import { JobInput } from './types';

export function buildAnalysisPrompt(resumeText: string, job: JobInput): string {
  return `Analyze resume vs job. Return JSON only.

JOB: ${job.jobTitle} | ${job.seniority} | ${job.industry || 'General'}

RESUME:
${resumeText}

SCORING: Skills(50%) Experience(25%) ATS(10%) Achievements(5%) Education(10%). Domain mismatch=15-30. Good=70-85. Excellent=85+.

Return ONLY this JSON:
{
  "overallScore": <0-100>,
  "summary": "<2 sentence summary>",
  "sectionScores": {
    "skillsMatch": <0-100>,
    "experienceMatch": <0-100>,
    "education": <0-100>,
    "atsReadability": <0-100>,
    "achievementQuality": <0-100>
  },
  "topActions": [
    {"priority": 1, "text": "<action>", "why": "<reason>"}
  ],
  "rewrites": [
    {"original": "<bullet>", "improved": "<better>", "toneVariants": {"technical": "", "product": "", "leadership": ""}}
  ],
  "keywordsToAdd": ["kw1", "kw2"],
  "atsChecklist": [{"item": "<check>", "passed": true}],
  "explainability": {
    "skillMatches": [{"skill": "<skill>", "evidence": ["<excerpt>"]}],
    "scoreBreakdown": "<brief>"
  }
}

Give 3 actions, 2 rewrites, 5 keywords, 4 ATS checks. Be concise.`;
}
