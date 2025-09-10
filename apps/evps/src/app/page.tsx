'use client';

import { useState, useCallback } from 'react';
import { SimplePieChart, type SimplePieChartData } from '@repo/ui/components/ui/simple-pie-chart';
import { ChartInsight, type ChartInsight as ChartInsightType } from '@repo/ui/components/ui/chart-insight';
import type { DashboardData, ChartDataPoint } from '@/types/dashboard';
import dashboardData from '@/data/dashboard-data.json';

// Convert JSON data to typed data
const typedDashboardData = dashboardData as DashboardData;

export default function Dashboard() {
  const [insights, setInsights] = useState<Record<string, ChartInsightType>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInsightGenerate = useCallback(async (
    data: ChartDataPoint[],
    title: string,
    customPrompt?: string
  ): Promise<string> => {
    const chartKey = title.replace(/\s+/g, '').toLowerCase();
    
    setLoadingStates(prev => ({ ...prev, [chartKey]: true }));
    setErrors(prev => ({ ...prev, [chartKey]: '' }));
    
    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chartData: data,
          chartTitle: title,
          chartType: 'pie',
          customPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate insight: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available');
      }

      let fullText = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        fullText += chunk;
        
        // Update insight in real-time as it streams
        setInsights(prev => ({
          ...prev,
          [chartKey]: {
            id: `${chartKey}-${Date.now()}`,
            text: fullText,
            generatedAt: new Date(),
            isEdited: false,
          }
        }));
      }

      return fullText;
    } catch (error) {
      console.error('Error generating insight:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate insight';
      setErrors(prev => ({ ...prev, [chartKey]: errorMessage }));
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, [chartKey]: false }));
    }
  }, []);

  const generateInsightForChart = useCallback(async (chartKey: string, data: SimplePieChartData[], title: string) => {
    return handleInsightGenerate(data, title);
  }, [handleInsightGenerate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Employee Value Perception Study
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Interactive dashboard showing demographic insights from our comprehensive employee survey (n=4,939).
            AI-powered analysis helps identify key patterns and actionable recommendations.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Age Distribution Chart */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <SimplePieChart
                data={typedDashboardData.ageDistribution.data}
                title={typedDashboardData.ageDistribution.title}
                showLegend={true}
                showTooltip={true}
                className="h-full"
              />
              <ChartInsight
                insight={insights['agedistribution']}
                onInsightGenerate={() => generateInsightForChart('agedistribution', typedDashboardData.ageDistribution.data, typedDashboardData.ageDistribution.title)}
                isGenerating={loadingStates['agedistribution']}
                error={errors['agedistribution']}
              />
            </div>
          </div>

          {/* Career Stage Chart */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <SimplePieChart
                data={typedDashboardData.careerStage.data}
                title={typedDashboardData.careerStage.title}
                showLegend={true}
                showTooltip={true}
                className="h-full"
              />
              <ChartInsight
                insight={insights['careerstagedistribution']}
                onInsightGenerate={() => generateInsightForChart('careerstagedistribution', typedDashboardData.careerStage.data, typedDashboardData.careerStage.title)}
                isGenerating={loadingStates['careerstagedistribution']}
                error={errors['careerstagedistribution']}
              />
            </div>
          </div>

          {/* Life Stage Chart */}
          <div className="lg:col-span-2 xl:col-span-1">
            <div className="space-y-4">
              <SimplePieChart
                data={typedDashboardData.lifeStage.data}
                title={typedDashboardData.lifeStage.title}
                showLegend={true}
                showTooltip={true}
                className="h-full"
              />
              <ChartInsight
                insight={insights['lifestagedistribution']}
                onInsightGenerate={() => generateInsightForChart('lifestagedistribution', typedDashboardData.lifeStage.data, typedDashboardData.lifeStage.title)}
                isGenerating={loadingStates['lifestagedistribution']}
                error={errors['lifestagedistribution']}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}