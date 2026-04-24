import { JobInput } from './types';

export function buildAnalysisPrompt(resumeText: string, job: JobInput): string {
  return `Analyze resume for ${job.jobTitle} (${job.seniority}, ${job.industry || 'General'}). Return ONLY JSON.

${resumeText}

Score: Skills 50%, Experience 25%, ATS 10%, Achievements 5%, Education 10%. Mismatch=15-30.

{"overallScore":<0-100>,"summary":"<2 lines>","sectionScores":{"skillsMatch":<n>,"experienceMatch":<n>,"education":<n>,"atsReadability":<n>,"achievementQuality":<n>},"topActions":[{"priority":1,"text":"<action>","why":"<why>"}],"rewrites":[{"original":"<bullet>","improved":"<better>","toneVariants":{"technical":"","product":"","leadership":""}}],"keywordsToAdd":["k1","k2","k3","k4","k5"],"atsChecklist":[{"item":"<check>","passed":true}],"explainability":{"skillMatches":[{"skill":"<s>","evidence":["<e>"]}],"scoreBreakdown":"<brief>"}}

3 actions, 2 rewrites, 5 keywords, 4 ATS checks. JSON only.`;
}
