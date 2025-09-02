'use client';

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@repo/ui/components/ui/collapsible";
import { ChevronDown, ChevronUp, Upload as UploadIcon } from "lucide-react";
import { api } from "@repo/backend/convex/_generated/api";
import { UploadDropzone } from "./upload-dropzone";
import { UploadList, Upload } from "./upload-list";

interface IntakeUploadsProps {
  intakeId: string;
}

export function IntakeUploads({ intakeId }: IntakeUploadsProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  
  // Query uploads from Convex
  const uploadsQuery = useQuery(api.functions.uploads.listByIntake, { intakeId });

  useEffect(() => {
    if (uploadsQuery) {
      setUploads(uploadsQuery);
    }
  }, [uploadsQuery]);

  const handleUploadComplete = () => {
    // Refresh the uploads list
    // The useQuery hook will automatically refresh when data changes
    setIsUploadOpen(false);
  };

  const handleUploadDeleted = (uploadId: string) => {
    setUploads(prev => prev.filter(upload => upload._id !== uploadId));
  };

  return (
    <Card density="compact">
      <CardHeader density="compact">
        <CardTitle className="flex items-center justify-between">
          <span>Files & Uploads</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">
              {uploads.length} file{uploads.length !== 1 ? "s" : ""}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUploadOpen(!isUploadOpen)}
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Upload Section */}
        <Collapsible open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0">
              <span>Upload New Files</span>
              {isUploadOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <UploadDropzone
              intakeId={intakeId}
              onUploadComplete={handleUploadComplete}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Files List */}
        <div>
          <h4 className="font-medium mb-3">Uploaded Files</h4>
          <UploadList
            uploads={uploads}
            onUploadDeleted={handleUploadDeleted}
          />
        </div>
      </CardContent>
    </Card>
  );
}