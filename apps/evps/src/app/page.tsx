'use client';

import { useState, useCallback } from 'react';
import { ChartWithInsight, type ChartInsight } from '@repo/ui/components/ui/chart-with-insight';
import type { DashboardData, ChartDataPoint, InsightData } from '@/types/dashboard';
import dashboardData from '@/data/dashboard-data.json';

// Convert JSON data to typed data
const typedDashboardData = dashboardData as DashboardData;

export default function Dashboard() {
  const [insights, setInsights] = useState<Record<string, ChartInsight>>({});
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

  const handleInsightUpdate = useCallback((insightId: string, newText: string) => {
    setInsights(prev => {
      const updatedInsights = { ...prev };
      
      // Find and update the insight with the matching ID
      for (const [key, insight] of Object.entries(updatedInsights)) {
        if (insight.id === insightId) {
          updatedInsights[key] = {
            ...insight,
            text: newText,
            isEdited: true,
          };
          break;
        }
      }
      
      return updatedInsights;
    });
  }, []);

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
            <ChartWithInsight
              data={typedDashboardData.ageDistribution.data}
              title={typedDashboardData.ageDistribution.title}
              insight={insights['agedistribution']}
              onInsightGenerate={handleInsightGenerate}
              onInsightUpdate={handleInsightUpdate}
              isGenerating={loadingStates['agedistribution']}
              error={errors['agedistribution']}
              showLegend={true}
              showTooltip={true}
              className="h-full"
            />
          </div>

          {/* Career Stage Chart */}
          <div className="lg:col-span-1">
            <ChartWithInsight
              data={typedDashboardData.careerStage.data}
              title={typedDashboardData.careerStage.title}
              insight={insights['careerstagedistribution']}
              onInsightGenerate={handleInsightGenerate}
              onInsightUpdate={handleInsightUpdate}
              isGenerating={loadingStates['careerstagedistribution']}
              error={errors['careerstagedistribution']}
              showLegend={true}
              showTooltip={true}
              className="h-full"
            />
          </div>

          {/* Life Stage Chart */}
          <div className="lg:col-span-2 xl:col-span-1">
            <ChartWithInsight
              data={typedDashboardData.lifeStage.data}
              title={typedDashboardData.lifeStage.title}
              insight={insights['lifestagedistribution']}
              onInsightGenerate={handleInsightGenerate}
              onInsightUpdate={handleInsightUpdate}
              isGenerating={loadingStates['lifestagedistribution']}
              error={errors['lifestagedistribution']}
              showLegend={true}
              showTooltip={true}
              className="h-full"
            />
          </div>
        </div>

        {/* Survey Information */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Survey Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">4,939</div>
              <div className="text-sm text-gray-600">Total Respondents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">3</div>
              <div className="text-sm text-gray-600">Key Demographics</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">AI</div>
              <div className="text-sm text-gray-600">Powered Insights</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}