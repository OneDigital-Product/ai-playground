import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Enrollment Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          Manage enrollment guide intakes and file uploads for internal operations.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View statistics and recent activity across all enrollment processes.
            </p>
            <Button asChild className="w-full">
              <Link href="/enrollment-dashboard/dashboard">View Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Intake Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create and manage enrollment guide intake requests.
            </p>
            <Button asChild className="w-full">
              <Link href="/enrollment-dashboard/intakes">Manage Intakes</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>File Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Upload and manage files for enrollment guides and documentation.
            </p>
            <Button asChild className="w-full">
              <Link href="/enrollment-dashboard/uploads">Manage Uploads</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This is an internal admin tool for managing enrollment processes during the migration phase. 
              No authentication is required - all sections are directly accessible.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/enrollment-dashboard/intakes/new">Create First Intake</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/enrollment-dashboard/uploads">Upload Files</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
