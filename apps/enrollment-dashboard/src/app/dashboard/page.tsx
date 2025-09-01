"use client";

import { useState, useCallback } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Download, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { DashboardStats } from "../../components/dashboard-stats";
import { DashboardFilters, type DashboardFilters as FiltersType } from "../../components/dashboard-filters";
import { IntakesTable } from "../../components/intakes-table";

type SortField =
  | "clientName"
  | "requestorName"
  | "guideType"
  | "communicationsAddOns"
  | "complexityBand"
  | "dateReceived"
  | "requestedProductionTime"
  | "status";

type SortOrder = "asc" | "desc";

const DEFAULT_FILTERS: FiltersType = {
  search: '',
  status: [],
  complexityBand: [],
  requestorName: '',
  planYear: undefined,
  requestedProductionTime: [],
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<FiltersType>(DEFAULT_FILTERS);
  const [isExporting, setIsExporting] = useState(false);
  const [sortField, setSortField] = useState<SortField>("dateReceived");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Fetch data
  const stats = useQuery(api.functions.intakes.stats, {});
  const intakes = useQuery(api.functions.intakes.list, {
    status: filters.status.length ? filters.status : undefined,
    complexityBand: filters.complexityBand.length ? filters.complexityBand : undefined,
    requestorName: filters.requestorName || undefined,
    planYear: filters.planYear,
    requestedProductionTime: filters.requestedProductionTime.length ? filters.requestedProductionTime : undefined,
    sortBy: sortField,
    order: sortOrder,
  });

  const handleFiltersChange = useCallback((newFilters: FiltersType) => {
    setFilters(newFilters);
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleStatusChange = useCallback(() => {
    // The useQuery hooks will automatically refetch when data changes
    // No manual refresh needed due to Convex real-time updates
  }, []);

  const handleIntakeDeleted = useCallback(() => {
    // The useQuery hooks will automatically refetch when data changes
    // No manual refresh needed due to Convex real-time updates
  }, []);

  const handleSortChange = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }, [sortField]);

  const handleExportCSV = useCallback(async () => {
    setIsExporting(true);
    
    try {
      // Build query parameters for the CSV export
      const queryParams = new URLSearchParams();
      
      if (filters.status.length > 0) {
        queryParams.set('status', JSON.stringify(filters.status));
      }
      
      if (filters.complexityBand.length > 0) {
        queryParams.set('complexityBand', JSON.stringify(filters.complexityBand));
      }
      
      if (filters.requestorName) {
        queryParams.set('requestorName', filters.requestorName);
      }
      
      if (filters.planYear) {
        queryParams.set('planYear', filters.planYear.toString());
      }
      
      if (filters.requestedProductionTime.length > 0) {
        queryParams.set('requestedProductionTime', JSON.stringify(filters.requestedProductionTime));
      }

      // Trigger download
      const url = `/enrollment-dashboard/api/dashboard.csv?${queryParams.toString()}`;
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `enrollment-dashboard-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Export failed:', error);
      // Could show a toast notification here
    } finally {
      setIsExporting(false);
    }
  }, [filters]);

  return (
    <main className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Enrollment Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive view of enrollment guide intakes with filtering, sorting, and export capabilities.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleExportCSV} 
            variant="outline" 
            disabled={isExporting || !intakes || intakes.length === 0}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export CSV
          </Button>
          <Button asChild>
            <Link href="/intakes/new">
              <Plus className="h-4 w-4 mr-2" />
              New Intake
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats stats={stats} isLoading={!stats} />

      {/* Filters */}
      <DashboardFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Intakes 
              {intakes && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({intakes.length} total)
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!intakes ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Loading intakes...</span>
              </div>
            </div>
          ) : (
            <div className="px-6 pb-6">
              <IntakesTable
                intakes={intakes}
                filters={filters}
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                onStatusChange={handleStatusChange}
                onIntakeDeleted={handleIntakeDeleted}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {(!intakes || intakes.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              No intakes available yet. Create your first intake to get started with the enrollment dashboard.
            </p>
            <Button asChild className="w-full">
              <Link href="/intakes/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Intake
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
