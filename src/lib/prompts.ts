import { JobInput } from './types';

export function buildAnalysisPrompt(resumeText: string, job: JobInput): string {
  return `You are ResumeMatchAI — a career-coach style assistant. Analyze this resume against the target job and return a structured JSON analysis.

TARGET JOB:
- Title: ${job.jobTitle}
- Seniority: ${job.seniority}
- Industry: ${job.industry || 'Not specified'}

RESUME TEXT:
${resumeText}

CRITICAL INSTRUCTIONS FOR SCORING:

1. **DYNAMICALLY DETERMINE REQUIRED SKILLS**: 
   - Based on the job title "${job.jobTitle}", intelligently determine what skills, technologies, and experience would be required for this specific role
   - Do NOT use a generic list - research what THIS specific job title requires in the real world
   - Consider industry-specific tools, frameworks, methodologies, and domain knowledge

2. **STRICT SKILL MISMATCH PENALTIES**:
   - If the resume is focused on a completely different skill domain (e.g., AI/ML resume for BPM/Workflow role), apply HEAVY penalties
   - Score should be 15-30 if there's fundamental domain mismatch
   - Score should be 30-50 if some transferable skills exist but major gaps
   - Score should be 50-70 for moderate fit with some gaps
   - Score should be 70-85 for good fit with minor improvements needed
   - Score should be 85-100 for excellent fit

3. **SCORING RUBRIC** (0-100):
   - Skills match (50%): % of required job keywords present + semantic match + domain alignment
   - Experience match (25%): relevant years, titles, role overlap, and relevant project work
   - ATS compatibility (10%): format, keywords, headings
   - Achievement quality (5%): quantified outcomes vs activity-only lines
   - Education/Cert (10%): required degree or certifications

4. Write a 3-4 sentence human summary that sounds like a career coach — encouraging but HONEST about fit.

5. List the top 7 action items ranked by impact. Each should be specific and include evidence from the resume.

6. Provide 3-5 rewritten bullets:
   - Show the original bullet (from resume)
   - Write an improved version emphasizing metrics, scale, tools, and impact
   - Provide tone variants: technical, product-facing, leadership

7. List missing keywords that would improve ATS matching for THIS specific job.

8. Provide an ATS checklist with pass/fail items.

RESPOND WITH ONLY VALID JSON in this exact format:
{
  "overallScore": <number 0-100>,
  "summary": "<3-4 sentence human summary>",
  "sectionScores": {
    "skillsMatch": <0-100>,
    "experienceMatch": <0-100>,
    "education": <0-100>,
    "atsReadability": <0-100>,
    "achievementQuality": <0-100>
  },
  "topActions": [
    {"priority": 1, "text": "<action item 6-14 words>", "why": "<evidence from resume>"}
  ],
  "rewrites": [
    {
      "original": "<original bullet from resume>",
      "improved": "<improved version>",
      "toneVariants": {
        "technical": "<technical tone>",
        "product": "<product tone>",
        "leadership": "<leadership tone>"
      }
    }
  ],
  "keywordsToAdd": ["keyword1", "keyword2"],
  "atsChecklist": [
    {"item": "<checklist item>", "passed": true}
  ],
  "explainability": {
    "skillMatches": [{"skill": "<skill>", "evidence": ["<resume excerpt>"]}],
    "scoreBreakdown": "<explanation of how score was computed, mentioning each section score>"
  }
}`
}
