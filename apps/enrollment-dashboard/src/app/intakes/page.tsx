"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { ComplexityBadge } from "../../components/complexity-badge";
import { StatusSelect, Status } from "../../components/status-select";

type IntakeListItem = {
  intakeId: string;
  clientName: string;
  requestorName: string;
  planYear: number;
  dateReceived: string;
  status: string;
  complexityBand: "Minimal" | "Low" | "Medium" | "High";
  complexityScore: number;
};

export default function IntakesPage() {
  const intakes = useQuery(api.functions.intakes.list, {}) as
    | IntakeListItem[]
    | undefined;

  const handleStatusChange = () => {
    // Refetch stats when status changes to update counters
    // The useQuery hooks will automatically refetch
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Enrollment Intakes</h1>
          <p className="text-muted-foreground">
            Manage enrollment guide intake requests and track their progress.
          </p>
        </div>
        <Button asChild>
          <Link href="/intakes/new">New Intake</Link>
        </Button>
      </div>
      
      <Card density="compact">
        <CardHeader density="compact">
          <CardTitle>Recent Intakes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3" density="compact">
          {!intakes ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : intakes.length === 0 ? (
            <p className="text-muted-foreground">
              No intakes available. Create your first intake to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {intakes.map((intake) => (
                <div 
                  key={intake.intakeId} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Link 
                    href={`/intakes/${intake.intakeId}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{intake.clientName}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {intake.intakeId} • Requestor: {intake.requestorName} • Plan Year: {intake.planYear}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Received: {new Date(intake.dateReceived).toLocaleDateString()}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3 ml-4">
                    <StatusSelect
                      intakeId={intake.intakeId}
                      currentStatus={intake.status as Status}
                      onStatusChange={handleStatusChange}
                      size="sm"
                    />
                    <ComplexityBadge 
                      band={intake.complexityBand} 
                      score={intake.complexityScore} 
                      showScore={true} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
