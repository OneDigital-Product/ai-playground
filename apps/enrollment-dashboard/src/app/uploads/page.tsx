import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

export default function UploadsPage() {
  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">File Uploads</h1>
          <p className="text-muted-foreground">
            Manage file uploads for enrollment guides and related documents.
          </p>
        </div>
        <Button>Upload Files</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No uploads available. Upload files to get started.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}