import { AnalysisResult, JobInput } from './types';
import { buildAnalysisPrompt } from './prompts';

// Models to try in order — if the primary fails to return valid JSON, try the next
const FALLBACK_MODELS = [
  'arcee-ai/trinity-large-preview:free',
  'google/gemma-3-12b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
];

export async function analyzeWithAI(
  resumeText: string,
  job: JobInput,
  apiKey: string
): Promise<AnalysisResult> {
  const primaryModel = process.env.NEXT_PUBLIC_AI_MODEL || 'arcee-ai/trinity-large-preview:free';

  // Trim resume text to first 3000 chars for speed
  const trimmedResume = resumeText.length > 3000 
    ? resumeText.substring(0, 3000) + '\n[... resume truncated for speed ...]'
    : resumeText;
  const prompt = buildAnalysisPrompt(trimmedResume, job);

  // Build the models to try: primary first, then fallbacks (de-duplicated)
  const modelsToTry = [primaryModel, ...FALLBACK_MODELS.filter(m => m !== primaryModel)];

  let lastError: string = '';

  for (const model of modelsToTry) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AI] Trying model: ${model}`);
      }

      const result = await callOpenRouter(apiKey, model, prompt);
      if (result) return result;

      lastError = `Model "${model}" returned unparseable response`;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[AI] Model "${model}" failed:`, lastError);
      }
    }
  }

  throw new Error(`AI analysis failed after trying ${modelsToTry.length} models. Last error: ${lastError}`);
}

/**
 * Call OpenRouter API directly with fetch (more reliable than SDK for error handling)
 */
async function callOpenRouter(
  apiKey: string,
  model: string,
  prompt: string
): Promise<AnalysisResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000); // 90s per attempt — free models can be slow

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://resumematchai.app',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are ResumeMatchAI. Analyze resumes against job descriptions. You MUST respond with ONLY a valid JSON object — no markdown, no explanation, no extra text. Just raw JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API error ${response.status}: ${errText.substring(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from AI model');
    }

    // Log raw response in dev mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AI Raw Response from ${model}]`, content.substring(0, 500));
    }

    const parsed = extractJSON(content);
    if (!parsed) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[AI Parse Failed - ${model}] Full response:`, content);
      }
      return null; // Return null to trigger fallback to next model
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
