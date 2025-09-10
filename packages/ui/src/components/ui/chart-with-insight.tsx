'use client';

import React, { useState } from 'react';
import { Edit2, RefreshCw, Loader2 } from 'lucide-react';
import { PieChart, type PieChartData, type PieChartProps } from './pie-chart';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
import { Textarea } from './textarea';

export interface ChartInsight {
  id: string;
  text: string;
  generatedAt: Date;
  isEdited?: boolean;
}

export interface ChartWithInsightProps extends Omit<PieChartProps, 'data'> {
  data: PieChartData[];
  insight?: ChartInsight;
  onInsightGenerate?: (data: PieChartData[], title: string, customPrompt?: string) => Promise<string>;
  onInsightUpdate?: (insightId: string, newText: string) => void;
  isGenerating?: boolean;
  error?: string;
}

export function ChartWithInsight({
  data,
  title,
  insight,
  onInsightGenerate,
  onInsightUpdate,
  isGenerating = false,
  error,
  className = '',
  ...chartProps
}: ChartWithInsightProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(insight?.text || '');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleGenerateInsight = async (prompt?: string) => {
    if (!onInsightGenerate || !title) return;
    
    setIsRegenerating(true);
    try {
      await onInsightGenerate(data, title, prompt);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveEdit = () => {
    if (insight?.id && onInsightUpdate && editedText.trim()) {
      onInsightUpdate(insight.id, editedText.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedText(insight?.text || '');
    setCustomPrompt('');
    setIsEditing(false);
  };

  const handleRegenerateWithPrompt = async () => {
    if (customPrompt.trim()) {
      await handleGenerateInsight(customPrompt.trim());
      setCustomPrompt('');
      setIsEditing(false);
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          {title}
          <div className="flex gap-2">
            {insight && (
              <Sheet open={isEditing} onOpenChange={setIsEditing}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Edit Insight</SheetTitle>
                    <SheetDescription>
                      Modify the insight text or ask AI to regenerate with a custom prompt.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-4 mt-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Current Insight
                      </label>
                      <Textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="min-h-[100px]"
                        placeholder="Enter your insight text..."
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Or Ask AI to Regenerate
                      </label>
                      <Textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="min-h-[80px]"
                        placeholder="Describe how you'd like the insight to be different..."
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleSaveEdit}
                        disabled={!editedText.trim()}
                        className="flex-1"
                      >
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleRegenerateWithPrompt}
                        disabled={!customPrompt.trim() || isRegenerating}
                        className="flex-1"
                      >
                        {isRegenerating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Regenerate
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      onClick={handleCancelEdit}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleGenerateInsight()}
              disabled={isGenerating || isRegenerating}
            >
              {isGenerating || isRegenerating ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              {insight ? 'Re-generate' : 'Generate'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-80">
          <PieChart
            data={data}
            {...chartProps}
          />
        </div>
        
        {/* Insight */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-3">AI Insight</h4>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {isGenerating && !insight && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating insight...</span>
            </div>
          )}
          
          {insight && (
            <div className="space-y-2">
              <p className="text-sm text-gray-700 leading-relaxed">
                {insight.text}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Generated {insight.generatedAt.toLocaleDateString()}
                  {insight.isEdited && ' • Edited'}
                </span>
              </div>
            </div>
          )}
          
          {!insight && !isGenerating && !error && (
            <p className="text-sm text-muted-foreground">
              Click "Generate" to create an AI insight for this chart.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
