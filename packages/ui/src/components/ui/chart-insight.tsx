"use client"

import React, { useState } from "react"
import { RefreshCw, Loader2, Edit2 } from "lucide-react"
import { Button } from "./button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./sheet"
import { Textarea } from "./textarea"

export interface ChartInsight {
  id: string
  text: string
  generatedAt: Date
  isEdited?: boolean
}

export interface ChartInsightProps {
  insight?: ChartInsight
  onInsightGenerate?: () => Promise<void>
  onInsightUpdate?: (insightId: string, newText: string) => void
  isGenerating?: boolean
  error?: string
  className?: string
}

export function ChartInsight({
  insight,
  onInsightGenerate,
  onInsightUpdate,
  isGenerating = false,
  error,
  className = "",
}: ChartInsightProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(insight?.text || '')

  const handleGenerateInsight = async () => {
    if (!onInsightGenerate) return
    
    setIsRegenerating(true)
    try {
      await onInsightGenerate()
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleSaveEdit = () => {
    if (insight?.id && onInsightUpdate && editedText.trim()) {
      onInsightUpdate(insight.id, editedText.trim())
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedText(insight?.text || '')
    setIsEditing(false)
  }

  // Update editedText when insight changes
  React.useEffect(() => {
    setEditedText(insight?.text || '')
  }, [insight?.text])

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
            <div className="flex gap-2">
              {onInsightUpdate && (
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
                        Modify the insight text manually.
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="space-y-4 mt-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Insight Text
                        </label>
                        <Textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="min-h-[120px]"
                          placeholder="Enter your insight text..."
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
                          variant="ghost" 
                          onClick={handleCancelEdit}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
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