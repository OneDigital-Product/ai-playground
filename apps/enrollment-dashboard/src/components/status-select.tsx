"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@repo/ui/components/ui/select";
import { Badge } from "@repo/ui/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "./toast";

export type Status = "NOT_STARTED" | "STARTED" | "ROADBLOCK" | "READY_FOR_QA" | "DELIVERED_TO_CONSULTANT";

const STATUS_OPTIONS: { value: Status; label: string; variant?: "default" | "secondary" | "destructive" | "outline" }[] = [
  { value: "NOT_STARTED", label: "Not Started", variant: "outline" },
  { value: "STARTED", label: "Started", variant: "secondary" },
  { value: "ROADBLOCK", label: "Roadblock", variant: "destructive" },
  { value: "READY_FOR_QA", label: "Ready for QA", variant: "default" },
  { value: "DELIVERED_TO_CONSULTANT", label: "Delivered to Consultant", variant: "default" },
];

interface StatusSelectProps {
  intakeId: string;
  currentStatus: Status;
  onStatusChange?: (newStatus: Status) => void;
  onError?: (error: string) => void;
  size?: "sm" | "default";
  disabled?: boolean;
}

export function StatusSelect({
  intakeId,
  currentStatus,
  onStatusChange,
  onError,
  size = "default",
  disabled = false
}: StatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState<Status>(currentStatus);
  
  const { showToast } = useToast();

  const handleStatusChange = async (newStatus: Status) => {
    if (newStatus === localStatus || isUpdating) return;

    const previousStatus = localStatus;
    setLocalStatus(newStatus); // Optimistic update
    setIsUpdating(true);

    try {
      const resp = await fetch(`/enrollment-dashboard/api/intakes/${intakeId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!resp.ok) {
        const payload = await resp.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to update status");
      }

      showToast("success", `Status updated to ${STATUS_OPTIONS.find(opt => opt.value === newStatus)?.label}`);
      onStatusChange?.(newStatus);
    } catch (error) {
      // Revert on error
      setLocalStatus(previousStatus);
      const errorMessage = error instanceof Error ? error.message : "Failed to update status";
      showToast("error", errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatusOption = STATUS_OPTIONS.find(option => option.value === localStatus);

  return (
    <div className="relative">
      <Select 
        value={localStatus} 
        onValueChange={(value) => handleStatusChange(value as Status)}
        disabled={disabled || isUpdating}
      >
        <SelectTrigger size={size} className="w-fit min-w-[140px]">
          <div className="flex items-center gap-2">
            <Badge variant={currentStatusOption?.variant || "outline"} className="text-xs">
              {currentStatusOption?.label || localStatus}
            </Badge>
            {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <Badge variant={option.variant} className="text-xs">
                {option.label}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
