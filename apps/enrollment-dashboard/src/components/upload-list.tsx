'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@repo/ui/components/ui/dropdown-menu";
import { 
  File, 
  Download, 
  Trash2, 
  MoreHorizontal, 
  FileText, 
  Image as ImageIcon, 
  Sheet 
} from "lucide-react";
import { useToast } from "./toast";

export interface Upload {
  _id: string;
  intakeId: string;
  kind: "GUIDE" | "PLAN_DOC" | "PAYROLL_SCREEN" | "OTHER";
  originalName: string;
  mimeType: string;
  bytes: number;
  createdAt: string;
}

interface UploadListProps {
  uploads: Upload[];
  onUploadDeleted?: (uploadId: string) => void;
}

const KIND_LABELS = {
  GUIDE: "Guide",
  PLAN_DOC: "Plan Document", 
  PAYROLL_SCREEN: "Payroll Screen",
  OTHER: "Other",
};

const KIND_COLORS = {
  GUIDE: "default",
  PLAN_DOC: "secondary",
  PAYROLL_SCREEN: "outline", 
  OTHER: "destructive",
} as const;

export function UploadList({ uploads, onUploadDeleted }: UploadListProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
    }
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
      return <Sheet className="h-4 w-4" />;
    }
    if (mimeType.includes("pdf") || mimeType.includes("document")) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const handleDownload = async (upload: Upload) => {
    try {
      // Use window.open to trigger download in a new tab/window
      const downloadUrl = `/enrollment-dashboard/api/uploads/${upload._id}/download`;
      window.open(downloadUrl, '_blank');
      showToast("success", `Downloading ${upload.originalName}`);
    } catch (error) {
      console.error("Download error:", error);
      showToast("error", "Failed to download file");
    }
  };

  const handleDelete = async (upload: Upload) => {
    if (deletingIds.has(upload._id)) return;

    setDeletingIds(prev => new Set(prev).add(upload._id));
    
    try {
      const response = await fetch(`/enrollment-dashboard/api/uploads/${upload._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete file");
      }

      showToast("success", `Deleted ${upload.originalName}`);
      onUploadDeleted?.(upload._id);
    } catch (error) {
      console.error("Delete error:", error);
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to delete file"
      );
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(upload._id);
        return next;
      });
    }
  };

  if (uploads.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <File className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No files uploaded yet</p>
        </CardContent>
      </Card>
    );
  }

  // Group uploads by kind for better organization
  const uploadsByKind = uploads.reduce((acc, upload) => {
    if (!acc[upload.kind]) acc[upload.kind] = [];
    acc[upload.kind].push(upload);
    return acc;
  }, {} as Record<string, Upload[]>);

  return (
    <div className="space-y-4">
      {Object.entries(uploadsByKind).map(([kind, kindUploads]) => (
        <Card key={kind}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant={KIND_COLORS[kind as keyof typeof KIND_COLORS]}>
                {KIND_LABELS[kind as keyof typeof KIND_LABELS]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ({kindUploads.length} file{kindUploads.length !== 1 ? "s" : ""})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {kindUploads.map((upload) => (
                <div
                  key={upload._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {getFileIcon(upload.mimeType)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {upload.originalName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatFileSize(upload.bytes)}</span>
                        <span>•</span>
                        <span>{new Date(upload.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{upload.mimeType.split('/')[1]?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(upload)}
                      disabled={deletingIds.has(upload._id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingIds.has(upload._id)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDownload(upload)}
                          disabled={deletingIds.has(upload._id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              disabled={deletingIds.has(upload._id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deletingIds.has(upload._id) ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete File</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{upload.originalName}&quot;? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(upload)}
                                disabled={deletingIds.has(upload._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deletingIds.has(upload._id) ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {uploads.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground text-center">
              Total: {uploads.length} file{uploads.length !== 1 ? "s" : ""} • 
              {" "}{formatFileSize(uploads.reduce((sum, upload) => sum + upload.bytes, 0))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}