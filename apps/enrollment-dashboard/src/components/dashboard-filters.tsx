"use client";

import { useState, useCallback } from "react";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import { Status, ComplexityBand, ProductionTime } from "../lib/schemas";

export interface DashboardFilters {
  search: string;
  status: Status[];
  complexityBand: ComplexityBand[];
  requestorName: string;
  planYear?: number;
  requestedProductionTime: ProductionTime[];
}

interface DashboardFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  onReset: () => void;
}

const STATUS_OPTIONS = [
  { value: Status.NOT_STARTED, label: "Not Started" },
  { value: Status.STARTED, label: "Started" },
  { value: Status.ROADBLOCK, label: "Roadblock" },
  { value: Status.READY_FOR_QA, label: "Ready for QA" },
  { value: Status.DELIVERED_TO_CONSULTANT, label: "Delivered to Consultant" },
] as const;

const COMPLEXITY_OPTIONS = [
  { value: ComplexityBand.MINIMAL, label: "Minimal" },
  { value: ComplexityBand.LOW, label: "Low" },
  { value: ComplexityBand.MEDIUM, label: "Medium" },
  { value: ComplexityBand.HIGH, label: "High" },
] as const;

const PRODUCTION_TIME_OPTIONS = [
  { value: ProductionTime.STANDARD, label: "Standard" },
  { value: ProductionTime.RUSH, label: "Rush" },
] as const;

export function DashboardFilters({ 
  filters, 
  onFiltersChange, 
  onReset 
}: DashboardFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = useCallback((updates: Partial<DashboardFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  }, [filters, onFiltersChange]);

  const toggleMultiSelect = useCallback(<T extends string>(
    array: T[],
    value: T,
    key: keyof DashboardFilters
  ) => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
    updateFilters({ [key]: newArray });
  }, [updateFilters]);

  const hasActiveFilters = 
    filters.search ||
    filters.status.length > 0 ||
    filters.complexityBand.length > 0 ||
    filters.requestorName ||
    filters.planYear ||
    filters.requestedProductionTime.length > 0;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="text-sm font-medium">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </div>

      {/* Always visible: Global search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search client name, intake ID, or requestor..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Expandable filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Status
            </Label>
            <div className="space-y-1">
              {STATUS_OPTIONS.map((status) => (
                <label
                  key={status.value}
                  className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 rounded p-1"
                >
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status.value)}
                    onChange={() => toggleMultiSelect(filters.status, status.value, 'status')}
                    className="rounded border-border"
                  />
                  <span>{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Complexity Band Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Complexity
            </Label>
            <div className="space-y-1">
              {COMPLEXITY_OPTIONS.map((complexity) => (
                <label
                  key={complexity.value}
                  className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 rounded p-1"
                >
                  <input
                    type="checkbox"
                    checked={filters.complexityBand.includes(complexity.value)}
                    onChange={() => toggleMultiSelect(filters.complexityBand, complexity.value, 'complexityBand')}
                    className="rounded border-border"
                  />
                  <span>{complexity.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Production Time Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Production Time
            </Label>
            <div className="space-y-1">
              {PRODUCTION_TIME_OPTIONS.map((time) => (
                <label
                  key={time.value}
                  className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 rounded p-1"
                >
                  <input
                    type="checkbox"
                    checked={filters.requestedProductionTime.includes(time.value)}
                    onChange={() => toggleMultiSelect(filters.requestedProductionTime, time.value, 'requestedProductionTime')}
                    className="rounded border-border"
                  />
                  <span>{time.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Plan Year and Requestor Name */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="planYear" className="text-xs font-medium text-muted-foreground">
                Plan Year
              </Label>
              <Input
                id="planYear"
                type="number"
                placeholder="e.g. 2024"
                value={filters.planYear || ''}
                onChange={(e) => updateFilters({ 
                  planYear: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                min={2020}
                max={2030}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="requestorName" className="text-xs font-medium text-muted-foreground">
                Requestor Name
              </Label>
              <Input
                id="requestorName"
                placeholder="Filter by requestor..."
                value={filters.requestorName}
                onChange={(e) => updateFilters({ requestorName: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1 pt-2 border-t">
          {filters.search && (
            <Badge variant="outline" className="text-xs">
              Search: {filters.search}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilters({ search: '' })}
              />
            </Badge>
          )}
          {filters.status.map(status => (
            <Badge key={status} variant="outline" className="text-xs">
              {STATUS_OPTIONS.find(s => s.value === status)?.label}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => toggleMultiSelect(filters.status, status, 'status')}
              />
            </Badge>
          ))}
          {filters.complexityBand.map(complexity => (
            <Badge key={complexity} variant="outline" className="text-xs">
              {COMPLEXITY_OPTIONS.find(c => c.value === complexity)?.label}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => toggleMultiSelect(filters.complexityBand, complexity, 'complexityBand')}
              />
            </Badge>
          ))}
          {filters.requestedProductionTime.map(time => (
            <Badge key={time} variant="outline" className="text-xs">
              {PRODUCTION_TIME_OPTIONS.find(t => t.value === time)?.label}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => toggleMultiSelect(filters.requestedProductionTime, time, 'requestedProductionTime')}
              />
            </Badge>
          ))}
          {filters.requestorName && (
            <Badge variant="outline" className="text-xs">
              Requestor: {filters.requestorName}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilters({ requestorName: '' })}
              />
            </Badge>
          )}
          {filters.planYear && (
            <Badge variant="outline" className="text-xs">
              Year: {filters.planYear}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilters({ planYear: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}