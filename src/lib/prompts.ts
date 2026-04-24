import { JobInput } from './types';

export function buildAnalysisPrompt(resumeText: string, job: JobInput): string {
  return `Analyze resume for ${job.jobTitle} (${job.seniority}, ${job.industry || 'General'}). Return ONLY JSON.

${resumeText}

Score: Skills 50%, Experience 25%, ATS 10%, Achievements 5%, Education 10%. Mismatch=15-30.

{
  "overallScore": <0-100>,
  "summary": "<2-3 sentence career-coach summary, honest about fit>",
  "sectionScores": {"skillsMatch":<n>,"experienceMatch":<n>,"education":<n>,"atsReadability":<n>,"achievementQuality":<n>},
  "topActions": [{"priority":1,"text":"<specific action 6-14 words>","why":"<evidence from resume>"}],
  "rewrites": [
    {
      "original": "<exact bullet point from the resume that needs improvement>",
      "improved": "<stronger version with metrics/impact>",
      "toneVariants": {
        "technical": "<technical/engineering tone rewrite>",
        "product": "<product/business tone rewrite>",
        "leadership": "<leadership/management tone rewrite>"
      }
    }
  ],
  "keywordsToAdd": ["keyword1","keyword2","keyword3","keyword4","keyword5"],
  "atsChecklist": [{"item":"<specific check>","passed":true}],
  "explainability": {
    "skillMatches": [{"skill":"<skill>","evidence":["<excerpt from resume>"]}],
    "scoreBreakdown": "<how score was computed>"
  }
}

Give 4 actions, 3 rewrites (pick the weakest resume bullets and show how to make them stronger with quantified impact), 5 keywords, 4 ATS checks. JSON only.`;
}
