"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { api } from "@repo/backend/convex/_generated/api";
import { IntakeOverview } from "../../../components/intake-overview";
import { IntakeSections } from "../../../components/intake-sections";

interface IntakeDetailClientProps {
  intakeId: string;
  currentTab: "overview" | "sections";
}

export function IntakeDetailClient({ intakeId, currentTab }: IntakeDetailClientProps) {
  const router = useRouter();

  // Fetch intake data
  const intake = useQuery(api.functions.intakes.get, { intakeId });
  
  // Fetch sections data
  const sections = useQuery(api.functions.sections.getByIntake, { intakeId });
  
  // Refresh function for section editor
  const handleRefresh = () => {
    // Force re-query by invalidating cache
    window.location.reload();
  };


  // Handle tab change
  const handleTabChange = (tab: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    
    if (tab === "overview") {
      searchParams.delete("tab");
    } else {
      searchParams.set("tab", tab);
    }
    
    // Remove the created parameter after first load
    searchParams.delete("created");
    
    const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    router.push(newUrl);
  };

  // Loading state
  if (intake === undefined || sections === undefined) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">Loading intake details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not found state
  if (intake === null) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Intake with ID &quot;{intakeId}&quot; was not found. Please check the ID and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="sections">
          Sections {sections && sections.length > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {sections.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <IntakeOverview intake={intake} />
      </TabsContent>

      <TabsContent value="sections" className="space-y-6">
        <IntakeSections 
          sections={sections || []} 
          intake={intake} 
          onRefresh={handleRefresh} 
        />
      </TabsContent>
    </Tabs>
  );
}