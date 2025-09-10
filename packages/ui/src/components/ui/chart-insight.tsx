"use client"

import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import type { Components as MarkdownComponents } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { RefreshCw, Loader2, Edit2, Heading, Type, Bold, Italic, List, ListOrdered } from "lucide-react"
import { Button } from "./button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./sheet"
import { ToggleGroup, ToggleGroupItem } from "./toggle-group"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog"
import { Textarea } from "./textarea"

export interface ChartInsight {
  id: string
  text: string
  generatedAt: Date
  isEdited?: boolean
}

export interface ChartInsightProps {
  insight?: ChartInsight
  // Optionally accept a custom prompt to guide regeneration
  onInsightGenerate?: (customPrompt?: string) => Promise<void>
  // Adjust existing text in-place using presets; returns new text
  onInsightAdjust?: (
    existingText: string,
    preset:
      | 'shorter'
      | 'longer'
      | 'bullets'
      | 'recommendation'
      | 'neutral'
      | 'consultative'
      | 'positive'
      | 'action'
      | 'conservative'
      | 'persuasive'
  ) => Promise<string>
  onInsightUpdate?: (insightId: string, newText: string) => void
  onDiscardChanges?: () => void
  isGenerating?: boolean
  error?: string
  className?: string
}

export function ChartInsight({
  insight,
  onInsightGenerate,
  onInsightAdjust,
  onInsightUpdate,
  onDiscardChanges,
  isGenerating = false,
  error,
  className = "",
}: ChartInsightProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [busyPreset, setBusyPreset] = useState<null | 'shorter' | 'longer' | 'recommendation' | 'bullets'>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(insight?.text || '')
  // Removed freeform prompt; use quick adjustment buttons instead

  const handleGenerateInsight = async () => {
    if (!onInsightGenerate) return
    
    setIsRegenerating(true)
    try {
      await onInsightGenerate()
    } finally {
      setIsRegenerating(false)
    }
  }

  const isDirty = (insight?.text || '') !== editedText

  const handleSaveEdit = () => {
    if (insight?.id && onInsightUpdate && editedText.trim()) {
      onInsightUpdate(insight.id, editedText.trim())
      setIsEditing(false)
    }
  }

  // Inline formatting helpers (bold/italic)
  const wrapSelection = (wrapperStart: string, wrapperEnd?: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const before = editedText.slice(0, start)
    const selected = editedText.slice(start, end)
    const after = editedText.slice(end)
    const endWrap = wrapperEnd ?? wrapperStart
    const newText = `${before}${wrapperStart}${selected || ""}${endWrap}${after}`
    setEditedText(newText)
    // restore selection inside wrappers
    const cursorStart = start + wrapperStart.length
    const cursorEnd = cursorStart + (selected ? selected.length : 0)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(cursorStart, cursorEnd)
    })
  }

  // Block formatting for selected lines
  const applyBlockFormat = (mode: 'normal' | 'heading' | 'ul' | 'ol') => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const before = editedText.slice(0, start)
    const selected = editedText.slice(start, end)
    const after = editedText.slice(end)
    // If no selection, use current line
    const text = selected || editedText
    const baseStart = selected ? 0 : editedText.lastIndexOf('\n', start - 1) + 1
    const baseEnd = selected ? selected.length : (() => { const idx = editedText.indexOf('\n', start); return idx === -1 ? editedText.length : idx })()
    const segment = selected || editedText.slice(baseStart, baseEnd)

    const lines = segment.split(/\n/)
    const stripped = lines.map(l => l.replace(/^\s*(?:[-*+]\s|\d+\.\s|#{1,6}\s)/, ''))

    let newSegment = ''
    if (mode === 'normal') {
      newSegment = stripped.join('\n')
    } else if (mode === 'heading') {
      newSegment = stripped.map(l => (l.trim() ? `## ${l}` : l)).join('\n')
    } else if (mode === 'ul') {
      newSegment = stripped.map(l => (l.trim() ? `- ${l}` : l)).join('\n')
    } else {
      let n = 1
      newSegment = stripped.map(l => (l.trim() ? `${n++}. ${l}` : l)).join('\n')
    }

    let newText: string
    if (selected) {
      newText = `${before}${newSegment}${after}`
      setEditedText(newText)
      const cursorStart = before.length
      const cursorEnd = cursorStart + newSegment.length
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(cursorStart, cursorEnd)
      })
    } else {
      newText = `${editedText.slice(0, baseStart)}${newSegment}${editedText.slice(baseEnd)}`
      setEditedText(newText)
      const cursor = baseStart + newSegment.length
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(cursor, cursor)
      })
    }
  }

  const handleCancelEdit = () => {
    if (isDirty) {
      setConfirmOpen(true)
      return
    }
    setEditedText(insight?.text || '')
    setIsEditing(false)
  }

  const handleQuickAdjust = async (
    preset: 'shorter' | 'longer' | 'recommendation' | 'bullets'
  ) => {
    if (!onInsightGenerate && !onInsightAdjust) return
    setBusyPreset(preset)
    setIsRegenerating(true)
    try {
      if (onInsightAdjust && insight?.text) {
        // Prefer adjust mode: revise existing text in-place, preserving user edits
        const source = isEditing ? editedText : insight.text
        await onInsightAdjust(source, preset)
        setIsEditing(false)
      } else {
        // Fallback: ask generator with concise style hint
        const hint = preset === 'shorter'
          ? 'Make the summary concise and brief; 1-2 sentences; short; concise.'
          : 'Make the summary more detailed; add one extra sentence with context; longer; detailed.'
        if (onInsightGenerate) {
          await onInsightGenerate(hint)
        }
        setIsEditing(false)
      }
    } finally {
      setBusyPreset(null)
      setIsRegenerating(false)
    }
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
        <div className="space-y-4">
          <div className="text-base md:text-lg text-gray-700 leading-relaxed">
            {(() => {
              const components: MarkdownComponents = {
                h2: ({ children }) => (
                  <h2 className="text-xl md:text-2xl font-semibold mb-3">{children}</h2>
                ),
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 space-y-1.5">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 space-y-1.5">{children}</ol>
                ),
                li: ({ children }) => <li>{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                a: ({ href, children }) => (
                  <a href={href} className="underline text-blue-600 hover:text-blue-700" target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
                code: (props) => {
                  const { inline, children } = props as { inline?: boolean; children: React.ReactNode }
                  return (
                    <code className={inline ? "px-1 py-0.5 rounded bg-gray-100" : "block p-2 rounded bg-gray-100"}>
                      {children}
                    </code>
                  )
                },
              }
              return (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={components}
                >
                  {insight.text}
                </ReactMarkdown>
              )
            })()}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Generated {insight.generatedAt.toLocaleDateString()}
              {insight.isEdited && ' • Edited'}
            </div>
            <div className="flex gap-2">
              {onInsightUpdate && (
              <Sheet
                open={isEditing}
                onOpenChange={(open) => {
                  if (!open && isDirty) {
                    // Intercept close when there are unsaved changes
                    setConfirmOpen(true)
                    return
                  }
                  setIsEditing(open)
                }}
              >
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </SheetTrigger>
                <SheetContent
                  onInteractOutside={(e) => {
                    if (isDirty) {
                      e.preventDefault()
                      setConfirmOpen(true)
                    }
                  }}
                  onEscapeKeyDown={(e) => {
                    if (isDirty) {
                      e.preventDefault()
                      setConfirmOpen(true)
                    }
                  }}
                >
                    <SheetHeader>
                      <SheetTitle>Edit Insight</SheetTitle>
                      <SheetDescription>
                        Edit the insight directly. Use Quick Adjustments to quickly make it shorter/longer, switch to bullets, or set a neutral tone — your edits will be preserved.
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="space-y-4 mt-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Insight Text
                      </label>
                      {/* Formatting toolbar */}
                      <div className="mb-2 flex items-center flex-wrap gap-2">
                        {/* 1) Heading, Normal (block, single-select) */}
                        <ToggleGroup
                          type="single"
                          value={""}
                          onValueChange={(v) => {
                            if (!v) return
                            if (v === 'heading' || v === 'normal') applyBlockFormat(v as any)
                          }}
                        >
                          <ToggleGroupItem value="heading" aria-label="Heading 2" className="h-8 w-8 p-0">
                            <Heading className="h-4 w-4" />
                          </ToggleGroupItem>
                          <ToggleGroupItem value="normal" aria-label="Normal text" className="h-8 w-8 p-0">
                            <Type className="h-4 w-4" />
                          </ToggleGroupItem>
                        </ToggleGroup>

                        {/* 2) Bold, Italic (inline, multi-select) */}
                        <ToggleGroup
                          type="multiple"
                          value={[]}
                          onValueChange={(vals) => {
                            const last = vals[vals.length - 1]
                            if (!last) return
                            if (last === 'bold') wrapSelection('**')
                            if (last === 'italic') wrapSelection('*')
                          }}
                        >
                          <ToggleGroupItem value="bold" aria-label="Bold" className="h-8 w-8 p-0">
                            <Bold className="h-4 w-4" />
                          </ToggleGroupItem>
                          <ToggleGroupItem value="italic" aria-label="Italic" className="h-8 w-8 p-0">
                            <Italic className="h-4 w-4" />
                          </ToggleGroupItem>
                        </ToggleGroup>

                        {/* 3) Bullet list, Numbered list (block, single-select) */}
                        <ToggleGroup
                          type="single"
                          value={""}
                          onValueChange={(v) => {
                            if (!v) return
                            if (v === 'ul' || v === 'ol') applyBlockFormat(v as any)
                          }}
                        >
                          <ToggleGroupItem value="ul" aria-label="Bullet list" className="h-8 w-8 p-0">
                            <List className="h-4 w-4" />
                          </ToggleGroupItem>
                          <ToggleGroupItem value="ol" aria-label="Numbered list" className="h-8 w-8 p-0">
                            <ListOrdered className="h-4 w-4" />
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                      <Textarea
                        ref={textareaRef}
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="min-h-[120px]"
                        placeholder="Enter your insight text..."
                      />
                      </div>
                      
                      <div className="pt-2">
                        <label className="text-sm font-medium mb-2 block">
                          Quick Adjustments
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            onClick={() => handleQuickAdjust('shorter')}
                            disabled={isGenerating || isRegenerating}
                            className="justify-center"
                          >
                            {busyPreset === 'shorter' ? (
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-1" />
                            )}
                            Shorter
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleQuickAdjust('longer')}
                            disabled={isGenerating || isRegenerating}
                            className="justify-center"
                          >
                            {busyPreset === 'longer' ? (
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-1" />
                            )}
                            Longer
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleQuickAdjust('recommendation')}
                            disabled={isGenerating || isRegenerating}
                            className="justify-center"
                          >
                            {busyPreset === 'recommendation' ? (
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-1" />
                            )}
                            Recommendation
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleQuickAdjust('bullets')}
                            disabled={isGenerating || isRegenerating}
                            className="justify-center"
                          >
                            {busyPreset === 'bullets' ? (
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-1" />
                            )}
                            Bullet points
                          </Button>
                        </div>
                      </div>
                      
                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={handleSaveEdit}
                        disabled={!editedText.trim()}
                        className="flex-1"
                      >
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                    </div>
                  </SheetContent>
                {/* Unsaved changes confirm dialog */}
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You have unsaved edits. If you leave, your changes will be lost.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
                        Keep editing
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setConfirmOpen(false)
                          setEditedText(insight?.text || '')
                          setIsEditing(false)
                          try { onDiscardChanges && onDiscardChanges() } catch {}
                        }}
                      >
                        Discard changes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                Regenerate
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
