"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/ui/alert-dialog";
import { AlertCircle, Trash2 } from "lucide-react";
import { api } from "@repo/backend/convex/_generated/api";
import { IntakeOverview } from "../../../components/intake-overview";
import { IntakeSections } from "../../../components/intake-sections";
import { useToast } from "../../../components/toast";

interface IntakeDetailClientProps {
  intakeId: string;
  currentTab: "overview" | "sections";
  createdFlag?: boolean;
}

export function IntakeDetailClient({ intakeId, currentTab, createdFlag }: IntakeDetailClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  // Fetch intake data
  const intake = useQuery(api.functions.intakes.get, { intakeId });
  
  // Fetch sections data
  const sections = useQuery(api.functions.sections.getByIntake, { intakeId });
  
  // Refresh function for section editor
  const handleRefresh = () => {
    // Force re-query by invalidating cache
    window.location.reload();
  };

  // Delete handler
  const handleDeleteIntake = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/enrollment-dashboard/api/intakes/${intakeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete intake');
      }
      
      // Show success toast if available
      if (window.__toastInstance) {
        window.__toastInstance.success('Intake deleted successfully');
      }
      
      // Navigate back to intakes list (basePath handled by Next.js)
      router.push('/intakes');
      
    } catch (error) {
      console.error('Delete intake error:', error);
      
      // Show error toast if available
      if (window.__toastInstance) {
        window.__toastInstance.error(
          error instanceof Error ? error.message : 'Failed to delete intake'
        );
      }
      
      setIsDeleting(false);
    }
  };

  // Show success toast once when arriving with created=1, then clear the flag
  useEffect(() => {
    if (createdFlag) {
      showToast("success", "Intake created successfully");
      const url = new URL(window.location.href);
      url.searchParams.delete("created");
      // Replace instead of push to avoid back button oddities
      router.replace(url.pathname + (url.search ? `?${url.searchParams.toString()}` : ""));
    }
  }, [createdFlag, router, showToast]);


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
      <Card density="compact">
        <CardContent density="compact" className="p-8">
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
    <div className="space-y-4">
      {/* Header Actions */}
      <Card density="compact">
        <CardHeader density="compact">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{intake.clientName}</h2>
              <p className="text-sm text-muted-foreground">
                Plan Year: {intake.planYear} • ID: {intake.intakeId}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isDeleting}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Intake
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Intake</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this intake for{' '}
                    <strong>{intake.clientName}</strong> (Plan Year: {intake.planYear})? 
                    This will permanently delete the intake, all associated sections, 
                    and uploaded files. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteIntake}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Intake'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
      </Card>

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
    </div>
  );
}
