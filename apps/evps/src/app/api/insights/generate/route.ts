import { NextRequest, NextResponse } from 'next/server';
import { createAzure } from '@ai-sdk/azure';
import { generateText } from 'ai';
import { z } from 'zod';

// Input validation schema
// Two request shapes: generate from data, or adjust existing text
const GenerateSchema = z.object({
  chartData: z.array(z.object({
    name: z.string(),
    value: z.number(),
    color: z.string(),
  })),
  chartTitle: z.string(),
  chartType: z.string().default('pie'),
  customPrompt: z.string().optional(),
});

const AdjustSchema = z.object({
  existingText: z.string().min(1),
  adjustment: z
    .enum([
      'shorter',
      'longer',
      'bullets',
      'recommendation',
      'neutral',
      // tone presets
      'consultative',
      'consultive', // alias
      'positive',
      'action',
      'conservative',
      'persuasive',
    ])
    .optional(),
  customPrompt: z.string().optional(),
});

const InsightRequestSchema = z.union([GenerateSchema, AdjustSchema]);

// Configure Azure OpenAI
// Resolve deployment name from common env var keys.
const deploymentName =
  process.env.AZURE_OPENAI_DEPLOYMENT ??
  process.env.AZURE_OPENAI_DEPLOYMENT_NAME ??
  'gpt-5-mini';

// Resolve endpoint using common aliases. Prefer AZURE_OPENAI_ENDPOINT; fall back to *_BASE_URL.
// If provided without the '/openai' suffix, normalize to include it so that
// URLs become: {baseURL}/v1{path} -> https://{resource}.openai.azure.com/openai/v1{path}
const rawAzureEndpoint =
  process.env.AZURE_OPENAI_ENDPOINT ??
  process.env.AZURE_OPENAI_BASE_URL ??
  undefined;

const azureEndpoint = (() => {
  if (!rawAzureEndpoint) return undefined;
  try {
    // Always sanitize to origin + /openai, ignoring any provided path/query
    const u = new URL(rawAzureEndpoint);
    return `${u.origin}/openai`;
  } catch {
    // Best-effort fallback: strip anything after the host and ensure /openai suffix
    const withoutQuery = rawAzureEndpoint.split('?')[0];
    const withoutPath = withoutQuery.replace(/(https?:\/\/[^/]+).*/, '$1');
    return `${withoutPath.replace(/\/$/, '')}/openai`;
  }
})();

const azureApiKey = process.env.AZURE_OPENAI_API_KEY;

// Resolve resource name directly or derive from endpoint host (e.g., https://<resource>.openai.azure.com)
const azureResourceName =
  process.env.AZURE_RESOURCE_NAME ??
  (() => {
    try {
      if (!azureEndpoint) return undefined;
      const host = new URL(azureEndpoint).hostname;
      const part = host.split(".")[0];
      return part || undefined;
    } catch {
      return undefined;
    }
  })();

// Feature flag: temporary deterministic-only mode to avoid slow/empty AI loops.
// Set EVPS_AI_DETERMINISTIC_ONLY=0 to re-enable model calls.
const DETERMINISTIC_ONLY = (process.env.EVPS_AI_DETERMINISTIC_ONLY ?? '1') !== '0';

// Instantiate model with explicit options when available to avoid relying on implicit env names.
// Create a configured Azure provider and then select the deployment model.
const azureProvider = createAzure({
  apiKey: azureApiKey,
  baseURL: azureEndpoint,
  resourceName: azureResourceName,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION, // optional, provider has a default
  // Use deployment-based URLs to ensure Azure resolves by deploymentId explicitly
  useDeploymentBasedUrls: true,
});
const azureModel = azureProvider(deploymentName);

function generateInsightPrompt(
  data: { name: string; value: number }[],
  title: string,
  customPrompt?: string,
): string {
  if (customPrompt) {
    return `${customPrompt}

Chart Data: ${JSON.stringify(data)}
Chart Title: ${title}

Please provide a concise, actionable insight based on this data.`;
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const dataDescription = data
    .map(item => `${item.name}: ${item.value} (${((item.value / totalValue) * 100).toFixed(1)}%)`)
    .join(', ');

  return `You are analyzing anonymized, aggregate survey distributions. Do not infer or speculate about sensitive attributes or individuals.

Chart Title: ${title}
Data (category: count with percent of total): ${dataDescription}
Total responses: ${totalValue}

Provide 2 short sentences that:
- Summarize notable distribution patterns in neutral, business-focused language
- Offer one general, non-sensitive recommendation grounded only in the provided counts

Avoid sensitive or personal topics, protected-class judgments, or causal claims.`;
}

function adjustInsightPrompt(
  existingText: string,
  styleHint?: string,
  preset?:
    | 'shorter'
    | 'longer'
    | 'bullets'
    | 'neutral'
    | 'consultative'
    | 'consultive'
    | 'positive'
    | 'action'
    | 'conservative'
    | 'persuasive',
): string {
  const canonical = preset === 'consultive' ? 'consultative' : preset;
  const apply =
    styleHint?.trim() ||
    (canonical === 'shorter'
      ? 'Make the text concise (1–2 sentences).'
      : canonical === 'longer'
      ? 'Make the text a bit more detailed, adding one neutral sentence without inventing new facts.'
      : canonical === 'bullets'
      ? 'Format as 2–3 bullet points.'
      : canonical === 'neutral'
      ? 'Use a neutral, business-focused tone only.'
      : canonical === 'consultative'
      ? 'Use a consultative tone: constructive, client-friendly guidance; one neutral recommendation; preserve facts; no new information.'
      : canonical === 'positive'
      ? 'Use a positive tone: highlight strengths and opportunities without overstating; preserve facts; no new information.'
      : canonical === 'action'
      ? 'Use an action-oriented tone: start with an action verb and one next step; keep it concise; preserve facts; no new information.'
      : canonical === 'conservative'
      ? 'Use a cautious, conservative tone: qualify claims (may/appears/suggests); avoid absolutes; preserve facts; no new information.'
      : canonical === 'persuasive'
      ? 'Use a persuasive tone: lead with a clear recommendation, then brief justification; preserve facts; no new information.'
      : 'Improve clarity and readability.');

  return `Revise the insight text below according to the instruction. 
Keep all facts, numbers, and claims exactly as written. 
Do not add new information. 
Return only the revised text (no explanations).

Instruction: ${apply}

Insight:
"""
${existingText}
"""`;
}

function deterministicSummary(
  data: { name: string; value: number }[],
  title: string,
  styleHint?: string,
): string {
  if (!data.length) return `No data available for ${title}.`;
  const total = data.reduce((s, d) => s + (Number.isFinite(d.value) ? d.value : 0), 0) || 1;
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const [top1, top2] = [sorted[0], sorted[1]];
  const pct = (v: number) => ((v / total) * 100).toFixed(1);
  const rangeMin = Math.min(...sorted.map(d => (d.value / total) * 100));
  const rangeMax = Math.max(...sorted.map(d => (d.value / total) * 100));
  const first = `For ${title}, ${top1.name} represents ${pct(top1.value)}%` +
    (top2 ? `, followed by ${top2.name} at ${pct(top2.value)}%` : '') +
    (sorted.length > 2 ? `; other categories range from ${rangeMin.toFixed(1)}% to ${rangeMax.toFixed(1)}%.` : '.');
  const second = `Consider tailoring communications or resources to the largest groups while ensuring smaller segments remain included.`;

  const hint = (styleHint || '').toLowerCase();
  const wantBullets = /\b(bullet|bullets|list|bullet points)\b/.test(hint);
  const wantConcise = /\b(concise|brief|short)\b/.test(hint);
  const wantLonger = /\b(long|longer|detailed|expand|more)\b/.test(hint);

  if (wantBullets) {
    if (wantLonger && top2) {
      const third = `Other categories range from ${rangeMin.toFixed(1)}% to ${rangeMax.toFixed(1)}%.`;
      return emphasizeNumbers(`- ${first}\n- ${second}\n- ${third}`);
    }
    return emphasizeNumbers(`- ${first}\n- ${wantConcise ? 'Keep actions concise and neutral.' : second}`);
  }
  if (wantConcise) {
    return emphasizeNumbers(`${first}`); // one sentence only
  }
  if (wantLonger) {
    const third = `Smaller segments span ${rangeMin.toFixed(1)}%–${rangeMax.toFixed(1)}%, suggesting varied representation across categories.`;
    return emphasizeNumbers(`${first} ${second} ${third}`);
  }
  return emphasizeNumbers(`${first} ${second}`);
}

function deterministicAdjust(
  existingText: string,
  preset?:
    | 'shorter'
    | 'longer'
    | 'bullets'
    | 'recommendation'
    | 'neutral'
    | 'consultative'
    | 'consultive'
    | 'positive'
    | 'action'
    | 'conservative'
    | 'persuasive',
  styleHint?: string,
): string {
  const text = (existingText || '').trim();
  if (!text) return '';

  const hint = (styleHint || '').toLowerCase();
  const wantBullets = preset === 'bullets' || /\b(bullet|bullets|list|bullet points)\b/.test(hint);
  const wantConcise = preset === 'shorter' || /\b(concise|brief|short)\b/.test(hint);
  const wantLonger = preset === 'longer' || /\b(long|longer|detailed|expand|more)\b/.test(hint);

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (wantBullets) {
    // Bullet the entire content by sentence or line, limiting to 6 for readability
    const lines = text.includes('\n') ? text.split(/\n+/).map(s => s.trim()).filter(Boolean) : sentences;
    const items = lines.slice(0, 6);
    return emphasizeNumbers(items.map(i => `- ${i.replace(/^[*-]\s+/, '')}`).join('\n'));
  }

  if (wantConcise) {
    // Keep first 1–2 sentences or ~220 chars, remove parentheticals
    const base = (sentences[0] || '') + (sentences[1] ? ' ' + sentences[1] : '');
    const sanitized = base.replace(/\([^)]*\)/g, '');
    const trimmed = sanitized.length > 220 ? sanitized.slice(0, 220).replace(/\s\S*$/, '…') : sanitized;
    return emphasizeNumbers(trimmed.trim());
  }

  if (wantLonger) {
    // Expand by splitting complex clauses and adding a neutral context line
    const expanded = text.replace(/;\s+/g, '. ').replace(/\s—\s/g, '. ').replace(/:\s+/g, ': ');
    const extra = 'Additionally, ensure smaller segments remain included while prioritizing the largest groups.';
    return emphasizeNumbers(expanded.includes(extra) ? expanded : `${expanded} ${extra}`);
  }

  // Tone adjustments
  const canonical = preset === 'consultive' ? 'consultative' : preset;

  if (canonical === 'consultative') {
    // Client-friendly guidance applied across the whole text
    const t = text.replace(/\b(you|we)\b/gi, 'the team').replace(/\b(should|must)\b/gi, 'should consider');
    const rec = 'Consider tailoring communications to the largest groups while keeping smaller segments included.';
    return emphasizeNumbers(t.includes(rec) ? t : `${t} ${rec}`);
  }

  if (canonical === 'positive') {
    let t = text.replace(/\b(challenge|problem|weakness|decline|low|drop|decrease)\b/gi, 'opportunity');
    if (!/[.!?]$/.test(t)) t += '.';
    const add = 'This presents opportunities to build on strengths.';
    return emphasizeNumbers(t.includes(add) ? t : `${t} ${add}`);
  }

  if (canonical === 'action') {
    // Lead with an action line, then retain the text
    const lead = 'Action: Focus efforts on the most represented categories and reinforce inclusion for smaller groups.';
    return emphasizeNumbers(text.startsWith('Action:') ? text : `${lead} ${text}`);
  }

  if (canonical === 'conservative') {
    // Add hedges and remove absolutes across the whole text
    let t = text
      .replace(/\b(will|prove|shows|demonstrates|confirms)\b/gi, 'suggests')
      .replace(/\b(always|never|definitely|certainly)\b/gi, 'often');
    if (!/\b(may|appears|suggests)\b/i.test(t)) t = `The data may indicate that ${t.charAt(0).toLowerCase()}${t.slice(1)}`;
    return emphasizeNumbers(t);
  }

  if (canonical === 'persuasive') {
    const lead = 'Recommendation: Focus on the largest segments and ensure smaller groups remain included.';
    return emphasizeNumbers(text.startsWith('Recommendation:') ? text : `${lead} ${text}`);
  }

  if (canonical === 'recommendation') {
    const lead = 'Recommendation: Focus on the largest segments and ensure smaller groups remain included.';
    const stripped = text.replace(/^Recommendation:[^\n]*\n?/i, '').trim();
    return emphasizeNumbers(`${lead} ${stripped}`);
  }

  // Neutral tone: remove emphatic words
  const neutral = text
    .replace(/\b(significant|notable|dramatic|remarkable|critical|huge|massive)\b/gi, 'clear')
    .replace(/\b(very|highly|extremely|strongly)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return emphasizeNumbers(neutral);
}

// Emphasize numeric figures and percentages by default for readability
function emphasizeNumbers(input: string): string {
  return input.replace(/(?<!\*)\b(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)(%?)(?!\*)\b/g, '**$1$2**');
}

export async function POST(request: NextRequest) {
  try {
    // Early configuration validation to return actionable errors instead of generic 500s
    if (!azureApiKey) {
      return NextResponse.json(
        { error: 'Azure OpenAI misconfiguration: AZURE_OPENAI_API_KEY is not set' },
        { status: 500 }
      );
    }
    // Require at least an endpoint or a resourceName
    if (!azureEndpoint && !azureResourceName) {
      return NextResponse.json(
        { error: 'Azure OpenAI misconfiguration: Provide AZURE_OPENAI_ENDPOINT (or AZURE_OPENAI_BASE_URL) or AZURE_RESOURCE_NAME' },
        { status: 500 }
      );
    }
    const body = await request.json();
    const validatedData = InsightRequestSchema.parse(body);

    // Determine mode and inputs
    const isAdjust = 'existingText' in validatedData;
    let prompt: string;
    let styleHint: string | undefined;
    if (isAdjust) {
      const { existingText, adjustment, customPrompt } = validatedData as z.infer<typeof AdjustSchema>;
      styleHint = customPrompt?.trim()
        ? `Style hint (apply only if safe): ${customPrompt.trim().slice(0, 220)}`
        : adjustment ? `Apply preset: ${adjustment}.` : undefined;
      prompt = adjustInsightPrompt(existingText, styleHint, adjustment);
    } else {
      const { chartData, chartTitle, customPrompt } = validatedData as z.infer<typeof GenerateSchema>;
      styleHint = customPrompt?.trim()
        ? `Style hint (apply only if safe): ${customPrompt.trim().slice(0, 220)}`
        : undefined;
      // Generate insight prompt
      prompt = generateInsightPrompt(chartData, chartTitle, customPrompt);
    }

    // Short-circuit: deterministic-only mode (temporary)
    if (DETERMINISTIC_ONLY) {
      if (isAdjust) {
        const { existingText, adjustment } = validatedData as z.infer<typeof AdjustSchema>;
        const text = deterministicAdjust(existingText, adjustment, styleHint);
        const changed = text.trim() !== existingText.trim();
        return NextResponse.json({ text, changed, source: 'deterministic' });
      } else {
        const { chartData, chartTitle } = validatedData as z.infer<typeof GenerateSchema>;
        const text = deterministicSummary(chartData, chartTitle, styleHint);
        return NextResponse.json({ text, changed: true, source: 'deterministic' });
      }
    }

    const system = [
      isAdjust
        ? 'You revise user-provided text. Keep a neutral tone, avoid sensitive inferences, preserve all facts and numbers, and return only the revised text.'
        : 'You summarize aggregate, anonymized data. Keep a neutral tone, avoid sensitive inferences, and base statements only on provided counts.',
      styleHint ? 'Incorporate the provided style hint only if it does not introduce sensitive content.' : undefined,
    ].filter(Boolean).join(' ');

    // Generate a non-streaming response for simpler client handling
    const result = await generateText({
      model: azureModel,
      system,
      prompt,
      // Reasoning models: prefer minimal thinking for latency
      reasoning: { effort: 'low' },
      maxOutputTokens: 512,
    });

    // Try multiple extraction paths for reasoning models
    type RawContent = { type?: string; text?: string };
    type RawOutputItem = { type?: string; content?: RawContent[] };
    type ResponseLike = {
      output_text?: unknown;
      output?: RawOutputItem[];
      finishReason?: string;
    };
    type ResultLike = {
      text?: string | null;
      response?: ResponseLike;
      finishReason?: string;
      usage?: Record<string, unknown>;
    };

    const resultLike = result as ResultLike;
    let text = (resultLike.text ?? '').trim();
    if (!text) {
      const raw = resultLike.response;
      const alt = (raw?.output_text ?? '').toString().trim();
      if (alt) text = alt;
      // Attempt to reconstruct from outputs if present
      if (!text && Array.isArray(raw?.output)) {
        try {
          const parts: string[] = [];
          for (const item of raw.output) {
            if (item?.type === 'message' && Array.isArray(item?.content)) {
              for (const c of item.content) {
                if (c?.type === 'output_text' && typeof c?.text === 'string') parts.push(c.text);
                if (c?.type === 'text' && typeof c?.text === 'string') parts.push(c.text);
              }
            }
          }
          if (parts.length) text = parts.join('\n').trim();
        } catch {}
      }
    }

    if (!text) {
      // Provide actionable diagnostics when the model produced no text
      const finishReason = resultLike?.finishReason ?? resultLike?.response?.finishReason;
      const usage = resultLike?.usage;
      console.warn('Azure model returned empty text', { finishReason, usage });
      // If the reason was length, retry once with a higher cap
      const wasLength = resultLike?.finishReason === 'length' || resultLike?.response?.finishReason === 'length';
      let retryPrompt: string;
      if (isAdjust) {
        // Safer retry for adjust mode
        {
          const { existingText, adjustment } = validatedData as z.infer<typeof AdjustSchema>;
          retryPrompt = adjustInsightPrompt(existingText, styleHint, adjustment);
        }
      } else {
        const { chartData } = validatedData as z.infer<typeof GenerateSchema>;
        retryPrompt = `Summarize the aggregate category distribution below in 2 short sentences.
Only describe percentages and counts from the data. Avoid sensitive or personal topics.
${styleHint ? `\n${styleHint}\n` : ''}
\n${JSON.stringify(chartData.map(d => ({ name: d.name, value: d.value })))}`;
      }

      const retry = await generateText({
        model: azureModel,
        system,
        prompt: retryPrompt,
        reasoning: { effort: 'low' },
        maxOutputTokens: wasLength ? 1024 : 384,
      });

      const retryLike = retry as ResultLike;
      let retryText = (retryLike.text ?? '').trim();
      if (!retryText) {
        const raw = retryLike.response;
        const alt = (raw?.output_text ?? '').toString().trim();
        if (alt) retryText = alt;
        if (!retryText && Array.isArray(raw?.output)) {
          try {
            const parts: string[] = [];
            for (const item of raw.output) {
              if (item?.type === 'message' && Array.isArray(item?.content)) {
                for (const c of item.content) {
                  if (c?.type === 'output_text' && typeof c?.text === 'string') parts.push(c.text);
                  if (c?.type === 'text' && typeof c?.text === 'string') parts.push(c.text);
                }
              }
            }
            if (parts.length) retryText = parts.join('\n').trim();
          } catch {}
        }
      }
      if (!retryText) {
        // Fall back
        if (isAdjust) {
          const { existingText, adjustment } = validatedData as z.infer<typeof AdjustSchema>;
          const fallback = deterministicAdjust(existingText, adjustment, styleHint);
          console.warn('Returning deterministic fallback adjust due to empty model output.');
          return NextResponse.json({ text: fallback, source: 'deterministic' });
        } else {
          const { chartData, chartTitle } = validatedData as z.infer<typeof GenerateSchema>;
          const fallback = deterministicSummary(chartData, chartTitle, styleHint);
          console.warn('Returning deterministic fallback summary due to empty model output.');
          return NextResponse.json({ text: fallback, source: 'deterministic' });
        }
      }

      return NextResponse.json({ text: retryText, source: 'model' });
    }

    return NextResponse.json({ text, source: 'model' });
  } catch (error) {
    // Normalize and surface useful Azure error info without leaking secrets
    const errObj = error as Partial<{
      status: number;
      code: string;
      message: string;
      cause: { status?: number; code?: string };
      response: { status?: number; data?: { error?: { code?: string } } };
    }>;
    const status: number | undefined = errObj?.status || errObj?.cause?.status || errObj?.response?.status;
    const code: string | undefined = errObj?.code || errObj?.cause?.code || errObj?.response?.data?.error?.code;
    const message: string = errObj?.message || 'Unknown error';

    // Log compact diagnostics on the server
    console.error('Error generating insight:', {
      status,
      code,
      message,
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Azure OpenAI request failed',
        status: status ?? 500,
        code,
        message,
      },
      { status: status ?? 500 }
    );
  }
}
