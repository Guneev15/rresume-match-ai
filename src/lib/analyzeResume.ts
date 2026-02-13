import OpenAI from 'openai';
import { AnalysisResult, JobInput } from './types';
import { buildAnalysisPrompt } from './prompts';

export async function analyzeWithAI(
  resumeText: string,
  job: JobInput,
  apiKey: string
): Promise<AnalysisResult> {
  // Use environment variables for provider and model configuration
  const provider = process.env.NEXT_PUBLIC_API_PROVIDER || 'openrouter';
  const isOpenRouter = provider === 'openrouter';

  const baseURL = isOpenRouter
    ? 'https://openrouter.ai/api/v1'
    : undefined; // defaults to OpenAI

  const client = new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  });

  // Read model from environment variable
  const model = process.env.NEXT_PUBLIC_AI_MODEL || 'arcee-ai/trinity-large-preview:free';

  const prompt = buildAnalysisPrompt(resumeText, job);

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are ResumeMatchAI, a career-coach assistant. You analyze resumes and return structured JSON. Always return valid JSON only, no markdown formatting or code blocks.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI model');
  }

  // Clean potential markdown code blocks from response
  const cleaned = content
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return normalizeResult(parsed);
  } catch {
    throw new Error('Failed to parse AI response. The model returned invalid JSON.');
  }
}

function normalizeResult(raw: Record<string, unknown>): AnalysisResult {
  const scores = (raw.sectionScores || raw.section_scores || {}) as Record<string, number>;

  return {
    overallScore: clamp(Number(raw.overallScore || raw.overall_score || 0), 0, 100),
    summary: String(raw.summary || 'Analysis complete.'),
    sectionScores: {
      skillsMatch: clamp(Number(scores.skillsMatch || scores.skills_match || 0), 0, 100),
      experienceMatch: clamp(Number(scores.experienceMatch || scores.experience_match || 0), 0, 100),
      education: clamp(Number(scores.education || 0), 0, 100),
      atsReadability: clamp(Number(scores.atsReadability || scores.ats_readability || 0), 0, 100),
      achievementQuality: clamp(Number(scores.achievementQuality || scores.achievement_quality || 0), 0, 100),
    },
    topActions: normalizeActions(raw.topActions || raw.top_actions),
    rewrites: normalizeRewrites(raw.rewrites),
    keywordsToAdd: normalizeStringArray(raw.keywordsToAdd || raw.keywords_to_add),
    atsChecklist: normalizeChecklist(raw.atsChecklist || raw.ats_checklist),
    explainability: {
      skillMatches: normalizeSkillMatches((raw.explainability as Record<string, unknown>)?.skillMatches || (raw.explainability as Record<string, unknown>)?.skill_matches),
      scoreBreakdown: String((raw.explainability as Record<string, unknown>)?.scoreBreakdown || (raw.explainability as Record<string, unknown>)?.score_breakdown || ''),
    },
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function normalizeActions(actions: unknown): AnalysisResult['topActions'] {
  if (!Array.isArray(actions)) return [];
  return actions.slice(0, 7).map((a: Record<string, unknown>, i: number) => ({
    priority: Number(a.priority || i + 1),
    text: String(a.text || ''),
    why: String(a.why || a.reason || ''),
  }));
}

function normalizeRewrites(rewrites: unknown): AnalysisResult['rewrites'] {
  if (!Array.isArray(rewrites)) return [];
  return rewrites.slice(0, 5).map((r: Record<string, unknown>) => ({
    original: String(r.original || ''),
    improved: String(r.improved || r.rewritten || ''),
    toneVariants: r.toneVariants || r.tone_variants
      ? {
          technical: String((r.toneVariants as Record<string, string>)?.technical || (r.tone_variants as Record<string, string>)?.technical || ''),
          product: String((r.toneVariants as Record<string, string>)?.product || (r.tone_variants as Record<string, string>)?.product || ''),
          leadership: String((r.toneVariants as Record<string, string>)?.leadership || (r.tone_variants as Record<string, string>)?.leadership || ''),
        }
      : undefined,
  }));
}

function normalizeStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(String).filter(Boolean);
}

function normalizeChecklist(list: unknown): AnalysisResult['atsChecklist'] {
  if (!Array.isArray(list)) return [];
  return list.map((item: unknown) => {
    if (typeof item === 'string') return { item, passed: false };
    const obj = item as Record<string, unknown>;
    return { item: String(obj.item || obj.text || ''), passed: Boolean(obj.passed) };
  });
}

function normalizeSkillMatches(matches: unknown): AnalysisResult['explainability']['skillMatches'] {
  if (!Array.isArray(matches)) return [];
  return matches.map((m: Record<string, unknown>) => ({
    skill: String(m.skill || ''),
    evidence: Array.isArray(m.evidence) ? m.evidence.map(String) : [],
  }));
}
