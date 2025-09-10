"use client"

import React, { useState } from "react"
import { RefreshCw, Loader2 } from "lucide-react"
import { Button } from "./button"

export interface ChartInsight {
  id: string
  text: string
  generatedAt: Date
  isEdited?: boolean
}

export interface ChartInsightProps {
  insight?: ChartInsight
  onInsightGenerate?: () => Promise<void>
  isGenerating?: boolean
  error?: string
  className?: string
}

export function ChartInsight({
  insight,
  onInsightGenerate,
  isGenerating = false,
  error,
  className = "",
}: ChartInsightProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleGenerateInsight = async () => {
    if (!onInsightGenerate) return
    
    setIsRegenerating(true)
    try {
      await onInsightGenerate()
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className={`mt-4 ${className}`}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm mb-3">
          {error}
        </div>
      )}
      
      {isGenerating && !insight && (
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Generating insight...</span>
        </div>
      )}
      
      {insight && (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            {insight.text}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Generated {insight.generatedAt.toLocaleDateString()}
              {insight.isEdited && ' • Edited'}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGenerateInsight}
              disabled={isGenerating || isRegenerating}
            >
              {isGenerating || isRegenerating ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      )}
      
      {!insight && !isGenerating && !error && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Generate an AI insight for this chart.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGenerateInsight}
            disabled={isGenerating || isRegenerating}
          >
            {isGenerating || isRegenerating ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Generate
          </Button>
        </div>
      )}
    </div>
  )
}