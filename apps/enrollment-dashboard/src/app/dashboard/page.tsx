"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { ComplexityBadge } from "../../components/complexity-badge";

export default function DashboardPage() {
  const stats = useQuery(api.functions.intakes.stats, {});

  return (
    <main className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Enrollment Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of enrollment guide intakes and uploads.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Intakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total === 0 ? "No intakes created yet" : "Total intake requests"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Intakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recent_count ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? (stats.by_status.STARTED ?? 0) + (stats.by_status.READY_FOR_QA ?? 0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active intakes
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/enrollment-dashboard/intakes/new">Create New Intake</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/enrollment-dashboard/intakes">View All Intakes</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Complexity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats || stats.total === 0 ? (
              <p className="text-muted-foreground">
                No intakes yet. Create your first intake to see complexity analysis.
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.by_complexity).map(([band, count]) => (
                  <div key={band} className="flex items-center justify-between">
                    <ComplexityBadge band={band as any} score={0} />
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}