import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { IntakeForm } from "@/components/intake-form";

export default function NewIntakePage() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">New Enrollment Intake</h1>
          <p className="text-muted-foreground">
            Create a new enrollment guide intake request.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/intakes">Back to Intakes</Link>
        </Button>
      </div>
      
      <IntakeForm />
    </main>
  );
}
