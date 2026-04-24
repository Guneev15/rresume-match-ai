import { AnalysisResult, JobInput } from './types';
import { buildAnalysisPrompt } from './prompts';

/** Wait for a given number of milliseconds */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function analyzeWithAI(
  resumeText: string,
  job: JobInput,
  apiKey: string
): Promise<AnalysisResult> {
  const model = process.env.NEXT_PUBLIC_AI_MODEL || 'google/gemma-4-26b-a4b-it:free';

  // Trim resume aggressively — fewer input tokens = less rate-limit pressure
  const trimmedResume = resumeText.length > 1500 
    ? resumeText.substring(0, 1500) + '\n[...]'
    : resumeText;
  const prompt = buildAnalysisPrompt(trimmedResume, job);

  // Retry up to 3 times with exponential backoff for rate limits
  const maxRetries = 3;
  let lastError = '';

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await callOpenRouter(apiKey, model, prompt);
      if (result) return result;
      lastError = `Model "${model}" returned unparseable response`;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);

      // On 429 rate limit, wait with exponential backoff then retry
      if (lastError.includes('429') && attempt < maxRetries - 1) {
        const waitMs = 5000 * Math.pow(2, attempt); // 5s, 10s, 20s
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[AI] Rate limited, waiting ${waitMs / 1000}s before retry...`);
        }
        await sleep(waitMs);
        continue;
      }
    }
  }

  throw new Error(`AI analysis failed after ${maxRetries} attempts. Last error: ${lastError}`);
}

/**
 * Call OpenRouter API with optimized parameters for free-tier rate limits
 */
async function callOpenRouter(
  apiKey: string,
  model: string,
  prompt: string
): Promise<AnalysisResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000); // 120s

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
            content: 'You are ResumeMatchAI. Respond with ONLY valid JSON. No markdown, no explanation.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0,       // Deterministic = faster, no sampling overhead
        max_tokens: 800,      // Minimal output = faster + less rate-limit usage
        top_p: 0.9,           // Slightly constrained for speed
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
