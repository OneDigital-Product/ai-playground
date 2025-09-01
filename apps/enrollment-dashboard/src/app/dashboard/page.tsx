import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No intakes created yet
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Intakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No pending intakes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No files uploaded
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
              <Link href="/enrollment-dashboard/uploads">Manage Uploads</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No recent activity. Start by creating your first intake request.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}