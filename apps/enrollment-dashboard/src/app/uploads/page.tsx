"use client";

import { useMemo, useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { Label } from "@repo/ui/components/ui/label";
import { Input } from "@repo/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { UploadDropzone } from "@/components/upload-dropzone";
import { UploadList, type Upload as UploadItem } from "@/components/upload-list";

export default function UploadsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIntakeId, setSelectedIntakeId] = useState("");
  const [recentUploads, setRecentUploads] = useState<UploadItem[]>([]);

  // Fetch intakes for selection (limit to recent)
  const intakes = useQuery(api.functions.intakes.list, {}) as
    | Array<{ intakeId: string; clientName: string; planYear: number }>
    | undefined;

  const recentIntakes = useMemo(() => (intakes || []).slice(0, 20), [intakes]);

  const handleUploaded = (
    files: Array<{ _id: string; originalName: string; mimeType: string; bytes: number; kind: string }>
  ) => {
    const timestamp = new Date().toISOString();
    const normalized: UploadItem[] = files.map((f) => ({
      _id: f._id,
      intakeId: selectedIntakeId,
      originalName: f.originalName,
      mimeType: f.mimeType,
      bytes: f.bytes,
      kind: f.kind as UploadItem["kind"],
      createdAt: timestamp,
    }));
    setRecentUploads((prev) => [...normalized, ...prev].slice(0, 50));
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">File Uploads</h1>
          <p className="text-muted-foreground">
            Manage file uploads for enrollment guides and related documents.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Upload Files</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="intakeId">Intake ID</Label>
                  <Input
                    id="intakeId"
                    placeholder="e.g., INT-2025-0001"
                    value={selectedIntakeId}
                    onChange={(e) => setSelectedIntakeId(e.target.value.trim())}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select Recent Intake</Label>
                  <Select
                    value={selectedIntakeId}
                    onValueChange={(val) => setSelectedIntakeId(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose from recent" />
                    </SelectTrigger>
                    <SelectContent>
                      {recentIntakes.map((i) => (
                        <SelectItem key={i.intakeId} value={i.intakeId}>
                          {i.clientName} ({i.planYear}) — {i.intakeId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedIntakeId ? (
                <UploadDropzone
                  intakeId={selectedIntakeId}
                  onUploaded={handleUploaded}
                  onUploadComplete={() => {
                    // Keep dialog open for batch uploads, but you could close here if desired
                  }}
                />
              ) : (
                <Card density="compact">
                  <CardContent density="compact" className="p-4 text-sm text-muted-foreground">
                    Enter or select an Intake to enable uploads.
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {recentUploads.length === 0 ? (
        <Card density="compact">
          <CardHeader density="compact">
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3" density="compact">
            <p className="text-muted-foreground">
              No uploads available. Upload files to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Uploads</h2>
          <UploadList uploads={recentUploads} />
        </div>
      )}
    </main>
  );
}
