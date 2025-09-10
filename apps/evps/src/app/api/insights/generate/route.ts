import { NextRequest, NextResponse } from 'next/server';
import { azure, createAzure } from '@ai-sdk/azure';
import { generateText } from 'ai';
import { z } from 'zod';

// Input validation schema
const InsightRequestSchema = z.object({
  chartData: z.array(z.object({
    name: z.string(),
    value: z.number(),
    color: z.string(),
  })),
  chartTitle: z.string(),
  chartType: z.string().default('pie'),
  customPrompt: z.string().optional(),
});

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

Chart Data: ${JSON.stringify(data, null, 2)}
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

function deterministicSummary(
  data: { name: string; value: number }[],
  title: string,
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
  return `${first} ${second}`;
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

    const { chartData, chartTitle, customPrompt } = validatedData;

    // Generate insight prompt
    const prompt = generateInsightPrompt(chartData, chartTitle, customPrompt);

    const system =
      'You summarize aggregate, anonymized data. Keep a neutral tone, avoid sensitive inferences, and base statements only on provided counts.';

    // Generate a non-streaming response for simpler client handling
    const result = await generateText({
      model: azureModel,
      system,
      prompt,
      temperature: 0.2,
      maxOutputTokens: 300,
    });

    const text = (result.text ?? '').trim();

    if (!text) {
      // Provide actionable diagnostics when the model produced no text
      const finishReason = (result as any)?.finishReason ?? (result as any)?.response?.finishReason;
      const usage = (result as any)?.usage;
      console.warn('Azure model returned empty text', { finishReason, usage });
      // Fallback: retry once with a simplified, explicitly safe prompt
      const safePrompt = `Summarize the aggregate category distribution below in 2 short sentences.
Only describe percentages and counts from the data. Avoid sensitive or personal topics.

${JSON.stringify(validatedData.chartData.map(d => ({ name: d.name, value: d.value })), null, 2)}`;

      const retry = await generateText({
        model: azureModel,
        system,
        prompt: safePrompt,
        temperature: 0.1,
        maxOutputTokens: 200,
      });

      const retryText = (retry.text ?? '').trim();
      if (!retryText) {
        // Fall back to a deterministic, neutral summary derived from counts only
        const fallback = deterministicSummary(validatedData.chartData, validatedData.chartTitle);
        console.warn('Returning deterministic fallback summary due to empty model output.');
        return NextResponse.json({ text: fallback, source: 'deterministic' });
      }

      return NextResponse.json({ text: retryText });
    }

    return NextResponse.json({ text });
  } catch (error) {
    // Normalize and surface useful Azure error info without leaking secrets
    const anyErr = error as any;
    const status: number | undefined = anyErr?.status || anyErr?.cause?.status || anyErr?.response?.status;
    const code: string | undefined = anyErr?.code || anyErr?.cause?.code || anyErr?.response?.data?.error?.code;
    const message: string = anyErr?.message || 'Unknown error';

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
