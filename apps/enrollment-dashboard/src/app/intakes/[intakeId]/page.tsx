import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { IntakeDetailClient } from "./client";

interface IntakeDetailPageProps {
  params: {
    intakeId: string;
  };
  searchParams: {
    tab?: "overview" | "sections";
    created?: "1";
  };
}

export default async function IntakeDetailPage({
  params,
  searchParams,
}: IntakeDetailPageProps) {
  const { intakeId } = params;
  const currentTab = searchParams.tab || "overview";
  const showCreatedAlert = searchParams.created === "1";

  return (
    <main className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/intakes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Intakes
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Intake Detail</h1>
            <p className="text-muted-foreground">
              ID: {intakeId}
            </p>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {showCreatedAlert && (
        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Intake has been successfully created! You can now view and manage the details below.
          </AlertDescription>
        </Alert>
      )}

      {/* Client Component for Data Fetching and Tabs */}
      <Suspense
        fallback={
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <p className="text-muted-foreground">Loading intake details...</p>
              </div>
            </CardContent>
          </Card>
        }
      >
        <IntakeDetailClient intakeId={intakeId} currentTab={currentTab} />
      </Suspense>
    </main>
  );
}
