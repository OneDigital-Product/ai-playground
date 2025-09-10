'use client';

import { useState, useCallback } from 'react';
import { SimplePieChart } from '@repo/ui/components/ui/simple-pie-chart';
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
    const chartKey = title === "Employee Demographics Overview" ? "consolidatedinsight" : title.replace(/\s+/g, '').toLowerCase();
    
    setLoadingStates(prev => ({ ...prev, [chartKey]: true }));
    setErrors(prev => ({ ...prev, [chartKey]: '' }));
    
    try {
      const response = await fetch('/evps/api/insights/generate', {
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

  const generateConsolidatedInsight = useCallback(async (): Promise<void> => {
    await handleInsightGenerate(
      [...typedDashboardData.ageDistribution.data, ...typedDashboardData.careerStage.data, ...typedDashboardData.lifeStage.data],
      "Employee Demographics Overview",
      `Analyze the demographic patterns across age distribution, career stage, and life stage data from our Employee Value Perception Study (n=4,939). Provide insights on key trends, potential correlations, and strategic implications for the organization.`
    );
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Age Distribution Chart */}
          <div className="lg:col-span-1">
            <SimplePieChart
              data={typedDashboardData.ageDistribution.data}
              title={typedDashboardData.ageDistribution.title}
              showLegend={true}
              showTooltip={true}
              className=""
            />
          </div>

          {/* Career Stage Chart */}
          <div className="lg:col-span-1">
            <SimplePieChart
              data={typedDashboardData.careerStage.data}
              title={typedDashboardData.careerStage.title}
              showLegend={true}
              showTooltip={true}
              className=""
            />
          </div>

          {/* Life Stage Chart */}
          <div className="lg:col-span-2 xl:col-span-1">
            <SimplePieChart
              data={typedDashboardData.lifeStage.data}
              title={typedDashboardData.lifeStage.title}
              showLegend={true}
              showTooltip={true}
              className=""
            />
          </div>
        </div>

        {/* Consolidated AI Insight */}
        <div className="mt-8">
          <ChartInsight
            insight={insights['consolidatedinsight']}
            onInsightGenerate={generateConsolidatedInsight}
            isGenerating={loadingStates['consolidatedinsight']}
            error={errors['consolidatedinsight']}
          />
        </div>

      </div>
    </div>
  );
}