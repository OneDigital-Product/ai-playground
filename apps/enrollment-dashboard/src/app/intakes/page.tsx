import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import Link from "next/link";

export default function IntakesPage() {
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
          <p className="text-muted-foreground">
            No intakes available. Create your first intake to get started.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}