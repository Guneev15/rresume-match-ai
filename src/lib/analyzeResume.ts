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

  // Trim resume text to first 3000 chars for speed (enough for key info)
  const trimmedResume = resumeText.length > 3000 
    ? resumeText.substring(0, 3000) + '\n[... resume truncated for speed ...]'
    : resumeText;
  const prompt = buildAnalysisPrompt(trimmedResume, job);

  // 60-second timeout — free-tier AI models can be slow
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are ResumeMatchAI. Analyze resumes and return ONLY valid JSON. Be concise.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1200,
    }, { signal: controller.signal });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI model');
  }

  // Log raw response in dev mode for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[AI Raw Response]', content.substring(0, 500));
  }

  const parsed = extractJSON(content);
  if (!parsed) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[AI Parse Failed] Full response:', content);
    }
    throw new Error('Failed to parse AI response. The model returned invalid JSON.');
  }
  return normalizeResult(parsed);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Robustly extract a JSON object from an AI response.
 * Tries multiple strategies to handle common model output issues.
 */
function extractJSON(raw: string): Record<string, unknown> | null {
  // Strategy 1: Clean markdown fences and try direct parse
  let cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  // Strategy 2: Extract JSON object with regex (greedy, outermost braces)
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}

    // Strategy 3: Aggressively clean common AI quirks, then parse
    try {
      let aggressive = jsonMatch[0]
        // Remove JS-style comments
        .replace(/\/\/[^\n]*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove trailing commas before } or ]
        .replace(/,\s*([\]}])/g, '$1')
        // Replace single quotes with double quotes (but not inside strings)
        .replace(/'/g, '"')
        // Remove control characters
        .replace(/[\x00-\x1F\x7F]/g, (ch) => ch === '\n' || ch === '\t' ? ch : '')
        // Fix unquoted keys: word: -> "word":
        .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')
        // Remove duplicate double quotes from the above fix
        .replace(/""+/g, '"');
      return JSON.parse(aggressive);
    } catch {}
  }

  // Strategy 4: Bracket-balanced extraction — find first valid { ... }
  const startIdx = cleaned.indexOf('{');
  if (startIdx !== -1) {
    let depth = 0;
    for (let i = startIdx; i < cleaned.length; i++) {
      if (cleaned[i] === '{') depth++;
      else if (cleaned[i] === '}') depth--;
      if (depth === 0) {
        const candidate = cleaned.substring(startIdx, i + 1);
        try {
          return JSON.parse(candidate);
        } catch {
          // Try with aggressive cleanup
          try {
            const aggressiveCandidate = candidate
              .replace(/,\s*([\]}])/g, '$1')
              .replace(/'/g, '"')
              .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')
              .replace(/""+/g, '"');
            return JSON.parse(aggressiveCandidate);
          } catch {}
        }
        break;
      }
    }
  }

  return null;
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
