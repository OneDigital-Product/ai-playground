import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import Link from "next/link";

export default function NewIntakePage() {
  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">New Enrollment Intake</h1>
          <p className="text-muted-foreground">
            Create a new enrollment guide intake request.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/enrollment-dashboard/intakes">Back to Intakes</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Intake Request Form</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Intake form will be implemented in the next phase.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}