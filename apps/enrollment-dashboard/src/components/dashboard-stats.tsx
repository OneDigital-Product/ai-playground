"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { TrendingUp, Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { ComplexityBadge } from "./complexity-badge";

export interface DashboardStats {
  total: number;
  by_status: Record<string, number>;
  by_complexity: Record<string, number>;
  recent_count: number;
}

interface DashboardStatsProps {
  stats: DashboardStats | null | undefined;
  isLoading?: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gap-4 py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const inProgressCount = (stats.by_status.STARTED || 0) + (stats.by_status.ROADBLOCK || 0);
  const completedCount = stats.by_status.DELIVERED_TO_CONSULTANT || 0;
  const readyForQACount = stats.by_status.READY_FOR_QA || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Intakes */}
      <Card className="gap-4 py-5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium">Total Intakes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total === 0 ? "No intakes created yet" : "All intake requests"}
          </p>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card className="gap-4 py-5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inProgressCount}</div>
          <div className="flex gap-2 text-xs text-muted-foreground">
            {stats.by_status.STARTED > 0 && (
              <Badge variant="secondary" className="text-xs px-1">
                Started: {stats.by_status.STARTED}
              </Badge>
            )}
            {stats.by_status.ROADBLOCK > 0 && (
              <Badge variant="destructive" className="text-xs px-1">
                Roadblock: {stats.by_status.ROADBLOCK}
              </Badge>
            )}
          </div>
          {readyForQACount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              + {readyForQACount} ready for QA
            </p>
          )}
        </CardContent>
      </Card>

      {/* Completed */}
      <Card className="gap-4 py-5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCount}</div>
          <p className="text-xs text-muted-foreground">
            Delivered to consultant
          </p>
          {stats.total > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((completedCount / stats.total) * 100)}% completion rate
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="gap-4 py-5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recent_count}</div>
          <p className="text-xs text-muted-foreground">
            Last 7 days
          </p>
          {stats.total > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((stats.recent_count / stats.total) * 100)}% of all intakes
            </p>
          )}
        </CardContent>
      </Card>

      {/* Complexity Distribution */}
      <Card className="md:col-span-2 gap-4 py-5">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Complexity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.total === 0 ? (
            <p className="text-xs text-muted-foreground">
              No intakes yet. Create your first intake to see complexity analysis.
            </p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(stats.by_complexity).map(([band, count]) => (
                <div key={band} className="flex flex-col items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <ComplexityBadge band={band as "Minimal" | "Low" | "Medium" | "High"} score={0} />
                  <div className="text-center">
                    <div className="text-lg font-semibold">{count}</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card className="md:col-span-2 gap-4 py-5">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium">Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.total === 0 ? (
            <p className="text-xs text-muted-foreground">
              No intakes available.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-xs">Not Started</Badge>
                <span className="text-sm font-medium">{stats.by_status.NOT_STARTED || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="text-xs">Started</Badge>
                <span className="text-sm font-medium">{stats.by_status.STARTED || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <Badge variant="destructive" className="text-xs">Roadblock</Badge>
                <span className="text-sm font-medium">{stats.by_status.ROADBLOCK || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <Badge variant="default" className="text-xs">Ready for QA</Badge>
                <span className="text-sm font-medium">{stats.by_status.READY_FOR_QA || 0}</span>
              </div>
              <div className="flex justify-between items-center sm:col-span-2">
                <Badge variant="default" className="text-xs">Delivered to Consultant</Badge>
                <span className="text-sm font-medium">{stats.by_status.DELIVERED_TO_CONSULTANT || 0}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
