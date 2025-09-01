"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { ComplexityBadge } from "../../components/complexity-badge";

export default function IntakesPage() {
  const intakes = useQuery(api.functions.intakes.list, {});

  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Enrollment Intakes</h1>
          <p className="text-muted-foreground">
            Manage enrollment guide intake requests and track their progress.
          </p>
        </div>
        <Button asChild>
          <Link href="/enrollment-dashboard/intakes/new">New Intake</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Intakes</CardTitle>
        </CardHeader>
        <CardContent>
          {!intakes ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : intakes.length === 0 ? (
            <p className="text-muted-foreground">
              No intakes available. Create your first intake to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {intakes.map((intake) => (
                <Link 
                  key={intake.intakeId} 
                  href={`/enrollment-dashboard/intakes/${intake.intakeId}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{intake.clientName}</h3>
                        <Badge variant="outline">{intake.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {intake.intakeId} • Requestor: {intake.requestorName} • Plan Year: {intake.planYear}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Received: {new Date(intake.dateReceived).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ComplexityBadge 
                        band={intake.complexityBand} 
                        score={intake.complexityScore} 
                        showScore={true} 
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}