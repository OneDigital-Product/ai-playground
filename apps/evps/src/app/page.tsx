'use client';

import { useState, useCallback, useEffect } from 'react';
import { SimplePieChart } from '@repo/ui/components/ui/simple-pie-chart';
import { ChartInsight, type ChartInsight as ChartInsightType } from '@repo/ui/components/ui/chart-insight';
import type { DashboardData, ChartDataPoint } from '@/types/dashboard';
import dashboardData from '@/data/dashboard-data.json';

// Convert JSON data to typed data
const typedDashboardData = dashboardData as DashboardData;

// Storage key for insights
const INSIGHTS_STORAGE_KEY = 'evps-insights';

export default function Dashboard() {
  // Extend stored insight with a dataHash to invalidate cache on data changes
  type StoredInsight = ChartInsightType & { dataHash?: string };
  const [insights, setInsights] = useState<Record<string, StoredInsight>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Compute a stable hash for the consolidated dataset to support cache invalidation
  const computeConsolidatedDataHash = (): string => {
    const payload = {
      age: {
        title: typedDashboardData.ageDistribution.title,
        lastUpdated: typedDashboardData.ageDistribution.lastUpdated,
        data: typedDashboardData.ageDistribution.data.map(d => ({ name: d.name, value: d.value, color: d.color })),
      },
      career: {
        title: typedDashboardData.careerStage.title,
        lastUpdated: typedDashboardData.careerStage.lastUpdated,
        data: typedDashboardData.careerStage.data.map(d => ({ name: d.name, value: d.value, color: d.color })),
      },
      life: {
        title: typedDashboardData.lifeStage.title,
        lastUpdated: typedDashboardData.lifeStage.lastUpdated,
        data: typedDashboardData.lifeStage.data.map(d => ({ name: d.name, value: d.value, color: d.color })),
      },
    };
    const str = JSON.stringify(payload);
    // Lightweight deterministic 32-bit hash (FNV-1a)
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h >>> 0) * 0x01000193;
    }
    return `v1_${(h >>> 0).toString(16)}`;
  };

  // Load insights from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(INSIGHTS_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Convert date strings back to Date objects
          Object.keys(parsed).forEach(key => {
            if (parsed[key].generatedAt) {
              parsed[key].generatedAt = new Date(parsed[key].generatedAt);
            }
          });
          setInsights(parsed);
        } catch (error) {
          console.error('Failed to parse stored insights:', error);
        }
      }
    }
  }, []);

  // Save insights to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(insights).length > 0) {
      localStorage.setItem(INSIGHTS_STORAGE_KEY, JSON.stringify(insights));
    }
  }, [insights]);

  const handleInsightGenerate = useCallback(async (
    data: ChartDataPoint[],
    title: string,
    customPrompt?: string,
    dataHash?: string,
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
        let serverMessage = '';
        try {
          const errJson = await response.json();
          const base = errJson?.error ? String(errJson.error) : '';
          const code = errJson?.code ? ` (${String(errJson.code)})` : '';
          const msg = errJson?.message ? `: ${String(errJson.message)}` : '';
          serverMessage = base || code || msg ? ` - ${base}${code}${msg}` : '';
        } catch {}
        throw new Error(`Failed to generate insight: ${response.status}${serverMessage}`);
      }
      const { text } = await response.json();
      if (!text || typeof text !== 'string' || !text.trim()) {
        throw new Error('No insight received from AI');
      }

      setInsights(prev => ({
        ...prev,
        [chartKey]: {
          id: chartKey,
          text,
          generatedAt: new Date(),
          isEdited: false,
          dataHash,
        }
      }));

      return text;
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
      // We store by chart key (e.g., 'consolidatedinsight'), and we set id equal to the key
      const key = insightId;
      const existingInsight = prev[key];
      if (!existingInsight) {
        console.warn('Attempting to update non-existent insight:', key);
        return prev;
      }
      return {
        ...prev,
        [key]: {
          ...existingInsight,
          text: newText,
          isEdited: true,
        }
      };
    });
  }, []);

  const generateConsolidatedInsight = useCallback(async (customPrompt?: string): Promise<void> => {
    try {
      const combined = [
        ...typedDashboardData.ageDistribution.data,
        ...typedDashboardData.careerStage.data,
        ...typedDashboardData.lifeStage.data,
      ];
      const dataHash = computeConsolidatedDataHash();
      await handleInsightGenerate(
        combined,
        "Employee Demographics Overview",
        customPrompt ?? `Summarize the aggregate distributions (age, career stage, life stage) from an anonymized employee survey (n=4,939).
Use neutral, business-focused language; avoid sensitive or personal inferences.
Provide 2 short sentences: (1) describe notable distribution patterns; (2) suggest one general, non-sensitive action grounded only in the provided counts.`,
        dataHash,
      );
    } catch (error) {
      console.error('Failed to generate consolidated insight:', error);
    }
  }, [handleInsightGenerate]);

  // Auto-generate consolidated insight if missing or data changed
  useEffect(() => {
    const key = 'consolidatedinsight';
    const currentHash = computeConsolidatedDataHash();
    const existing = insights[key];
    const needsGeneration = !existing || existing.dataHash !== currentHash;
    if (needsGeneration && !loadingStates[key]) {
      // Fire and forget; errors are handled inside and displayed via error state
      generateConsolidatedInsight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedDashboardData.ageDistribution.lastUpdated, typedDashboardData.careerStage.lastUpdated, typedDashboardData.lifeStage.lastUpdated]);

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
            onInsightUpdate={handleInsightUpdate}
            isGenerating={loadingStates['consolidatedinsight']}
            error={errors['consolidatedinsight']}
          />
        </div>

      </div>
    </div>
  );
}
