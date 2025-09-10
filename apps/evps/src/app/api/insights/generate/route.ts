import { NextRequest, NextResponse } from 'next/server';
import { azure } from '@ai-sdk/azure';
import { streamText } from 'ai';
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
const azureModel = azure('gpt-5-mini', {
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT!,
  apiVersion: '2024-02-01',
});

function generateInsightPrompt(data: any[], title: string, customPrompt?: string): string {
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

  return `Analyze this employee value perception data and provide actionable insights:

Chart Title: ${title}
Data: ${dataDescription}
Total: ${totalValue}

Please provide:
1. A key insight about what this data reveals
2. One actionable recommendation for improvement
3. Any notable patterns or trends

Keep the response concise (2-3 sentences) and focused on business value.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = InsightRequestSchema.parse(body);

    const { chartData, chartTitle, customPrompt } = validatedData;

    // Generate insight prompt
    const prompt = generateInsightPrompt(chartData, chartTitle, customPrompt);

    // Stream the AI response
    const result = streamText({
      model: azureModel,
      prompt,
      temperature: 0.7,
      maxTokens: 200,
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error('Error generating insight:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate insight' },
      { status: 500 }
    );
  }
}