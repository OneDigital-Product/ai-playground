"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Edit, Save, X } from "lucide-react";
import { type SectionCode } from "../lib/sections";
import { useToast } from "./toast";

interface SectionEditorProps {
  intakeId: string;
  sectionCode: SectionCode;
  description: string;
  changed?: boolean;
  included?: boolean;
  onUpdate: () => void;
}

export function SectionEditor({ 
  intakeId, 
  sectionCode, 
  description, 
  changed = false, 
  included = true,
  onUpdate 
}: SectionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(description);
  const [editChanged, setEditChanged] = useState(changed);
  const [editIncluded, setEditIncluded] = useState(included);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleStartEdit = () => {
    setEditDescription(description);
    setEditChanged(changed);
    setEditIncluded(included);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditDescription(description);
    setEditChanged(changed);
    setEditIncluded(included);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Update section description if changed
      if (editDescription !== description) {
        const response = await fetch(`/enrollment-dashboard/api/intakes/${intakeId}/sections/${sectionCode}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            change_description: editDescription,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update section description");
        }
      }

      // Update flags if changed
      if (editChanged !== changed || editIncluded !== included) {
        const response = await fetch(`/enrollment-dashboard/api/intakes/${intakeId}/sections/${sectionCode}/flags`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(editChanged !== changed && { changed: editChanged }),
            ...(editIncluded !== included && { included: editIncluded }),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update section flags");
        }
      }

      showToast("success", "Section updated successfully");
      setIsEditing(false);
      onUpdate(); // Trigger refetch
    } catch (error) {
      console.error("Failed to save section:", error);
      showToast("error", error instanceof Error ? error.message : "Failed to update section");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">
            Change Description
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartEdit}
            className="h-auto p-1"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="bg-muted p-3 rounded whitespace-pre-wrap text-sm">
          {description || "No description provided"}
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${changed ? "bg-orange-500" : "bg-gray-300"}`} />
            <span className="text-muted-foreground">Changed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${included ? "bg-green-500" : "bg-gray-300"}`} />
            <span className="text-muted-foreground">Included in Guide</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Edit Section</Label>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-auto p-1"
          >
            <X className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            className="h-auto p-1"
          >
            <Save className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Textarea
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
        placeholder="Enter change description..."
        className="min-h-[80px] text-sm"
        disabled={isLoading}
      />

      <div className="flex items-center gap-6">
        <div className="flex items-center space-x-2">
          <Input
            type="checkbox"
            id={`changed-${sectionCode}`}
            checked={editChanged}
            onChange={(e) => setEditChanged(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4"
          />
          <Label htmlFor={`changed-${sectionCode}`} className="text-xs">
            Section Changed
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            type="checkbox"
            id={`included-${sectionCode}`}
            checked={editIncluded}
            onChange={(e) => setEditIncluded(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4"
          />
          <Label htmlFor={`included-${sectionCode}`} className="text-xs">
            Include in Guide
          </Label>
        </div>
      </div>

      {isLoading && (
        <div className="text-xs text-muted-foreground">Saving changes...</div>
      )}
    </div>
  );
}